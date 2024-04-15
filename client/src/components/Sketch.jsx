import { useEffect, useState } from 'react';
import * as ms from '@magenta/sketch';
import axios from 'axios';
import * as vtp from '../vecterrapen';
import Feedback from './Feedback';
import html2canvas from 'html2canvas';
import { FaDownload } from 'react-icons/fa';
import { FaShareAlt } from 'react-icons/fa';
import { FaRedo } from 'react-icons/fa';

const Sketch = ({ inputValue, setLoading }) => {
    const [model, setModel] = useState(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [ModelOrStroke, setModelOrStroke] = useState(0); // 0 for model, 1 for stroke
    const [copySuccess, setCopySuccess] = useState(false);
    const [rerenderFlag, setRerenderFlag] = useState(0);

    useEffect(() => {
        const checkInputAvailability = async () => {
            const response = await axios.get(
                `http://localhost:8080/api/magenta/check?word=${inputValue}`
            );
            console.log(response.data);
            // Delete all childern of the container
            const container = document.getElementById('sketch-container');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            if (response.data.flag === false) {
                setModelOrStroke(1);
                setStrokes(response.data.word);
                setLoading(false);
                return;
            } else {
                const modelValue = response.data.word;
                loadModel(modelValue);
            }
        };

        // Load the model on component mount or object change
        if (modelLoaded) {
            setModel(null); // Unload the model
            setModelLoaded(false); // Reset model loaded state

            // Clear the canvas
            const canvas = document.querySelector('canvas');
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);

            // unmount the canvas
            canvas.remove();
        }

        const loadModel = async (modelValue) => {
            console.log('Loading model...');
            setLoading(true);
            try {
                const newModel = new ms.SketchRNN(
                    `https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/${modelValue}.gen.json`
                );
                await newModel.initialize();
                // Initialize the scale factor for the model. Bigger -> large outputs
                newModel.setPixelFactor(3.0);
                setModel(newModel);
                setModelLoaded(true);
                console.log('SketchRNN model loaded.');
            } catch (error) {
                alert('Some error occured while loading the model. Please try again.');
                console.error('Error loading model:', error);
            }
            setLoading(false);
        };

        setFeedbackVisible(false);
        if (inputValue) {
            checkInputAvailability();
        }

        return () => {
            // Cleanup function when the component unmounts (optional)
        };
    }, [inputValue, rerenderFlag]);

    useEffect(() => {
        console.log('Model loaded:', modelLoaded);
    }, [modelLoaded]);

    // Drawing loop
    useEffect(() => {
        // Ensure p5.js is loaded before creating p5 instance
        if (window.p5 && model) {
            // p5 sketch logic using the model (if available)
            const sketch = (p) => {
                // Pass sampleNewState as parameter
                let modelState = model.zeroState(); // Initialize modelState here
                const temperature = 0.45;
                let dx, dy; // Offsets of the pen strokes, in pixels.
                let x, y; // Absolute coordinates on the screen of where the pen is.
                let pen = [0, 0, 0]; // Current pen state, [pen_down, pen_up, pen_end].
                [dx, dy, ...pen] = model.zeroInput();
                let previousPen = [1, 0, 0]; // Previous pen state.
                const PEN = { DOWN: 0, UP: 1, END: 2 };

                p.setup = function () {
                    const containerSize = document
                        .getElementById('sketch-container')
                        .getBoundingClientRect();
                    const screenWidth = Math.floor(containerSize.width) - 22;
                    const screenHeight = Math.floor(containerSize.height) - 9;
                    console.log('Canvas size:', screenWidth, screenHeight); // Log canvas size
                    p.createCanvas(screenWidth, screenHeight);
                    p.frameRate(60);

                    // Initial setup for drawing
                    setupNewDrawing();
                };

                p.draw = function () {
                    console.log('Drawing at:', x, y); // Log drawing coordinates
                    if (!model) return; // Wait for model to load

                    // If we finished the previous drawing, start a new one.
                    if (previousPen[PEN.END] === 1) {
                        p.noLoop();
                        setFeedbackVisible(true);
                    }

                    // Sample new state using the provided sampleNewState function
                    [dx, dy, ...pen] = sampleNewState();

                    // Only draw on the paper if the pen is still touching the paper.
                    if (previousPen[PEN.DOWN] == 1) {
                        p.line(x, y, x + dx, y + dy); // Draw line connecting prev point to current point.
                    }

                    // Update the absolute coordinates from the offsets
                    x += dx;
                    y += dy;

                    // Update the previous pen's state to the current one we just sampled.
                    previousPen = pen;
                };

                // Define sampleNewState function
                function sampleNewState() {
                    console.log('Sampling new state...', modelState); // Log sampling new state
                    // if (!modelState) return [dx, dy, ...pen]; // Return previous state if modelState is not initialized
                    // Using the previous pen states, and hidden state, get next hidden state
                    modelState = model.update([dx, dy, ...pen], modelState);

                    // Get the parameters of the probability distribution (pdf) from hidden state.
                    const pdf = model.getPDF(modelState, temperature);

                    // Sample the next pen's states from our probability distribution.
                    return model.sample(pdf);
                }
                // Function to setup a new drawing
                function setupNewDrawing() {
                    p.background(255, 255, 255, 255);
                    x = p.width / 2.0;
                    y = p.height / 3.0;
                    const lineColor = p.color(
                        p.random(64, 224),
                        p.random(64, 224),
                        p.random(64, 224)
                    );

                    p.strokeWeight(3.0);
                    p.stroke(lineColor);
                }
            };

            // Create p5 instance
            new window.p5((p) => sketch(p), 'sketch-container');
        }
    }, [model]);

    async function drawStroke(strokesArray, pen) {
        const smoothness = 5; // You can adjust this parameter for more or less smoothing

        for (const stroke of strokesArray) {
            pen.penUp();
            pen.goto(stroke[0][0], stroke[1][0]);
            pen.penDown();

            for (let i = 1; i < stroke[0].length; i++) {
                const startX = stroke[0][i - 1];
                const startY = stroke[1][i - 1];
                const endX = stroke[0][i];
                const endY = stroke[1][i];

                // Calculate intermediate points using quadratic Bezier curve
                for (let t = 0; t <= 1; t += 1 / smoothness) {
                    const x = startX + (endX - startX) * t;
                    const y = startY + (endY - startY) * t;
                    pen.goto(x, y);
                    await new Promise((resolve) => setTimeout(resolve, 10)); // Adjust the delay time as needed
                }
            }
        }
        setFeedbackVisible(true);
    }

    function transformAndTranslate(strokesArray) {
        strokesArray = JSON.parse(strokesArray);

        let transformedArray = strokesArray.map((stroke) => {
            let transformedStroke = [
                stroke[0].map((x) => x - 125),
                stroke[1].map((y) => -y + 125),
            ];

            return transformedStroke;
        });

        return transformedArray;
    }

    // Strokes with Quickdraw
    useEffect(() => {
        // Wait for strokes to be available
        if (strokes?.length > 0) {
            const containerSize = document
                .getElementById('sketch-container')
                .getBoundingClientRect();
            const screenWidth = Math.floor(containerSize.width) - 22;
            const screenHeight = Math.floor(containerSize.height) - 9;

            // setup first screen
            const screen_1 = vtp.penScreen(screenWidth, screenHeight, 'sketch-container');
            const pen_1 = vtp.addPenTo(screen_1);

            // Set the colors of the screen
            screen_1.bgColor('white');
            pen_1.penColor('black');

            // Pick a random stroke
            const randomStroke = strokes[Math.floor(Math.random() * strokes.length)];

            console.log('Drawing stroke:', randomStroke);

            // Draw the stroke
            const transformedStrokesArray = transformAndTranslate(randomStroke);
            drawStroke(transformedStrokesArray, pen_1);
            setLoading(false);
        }
    }, [strokes]);
    function downloadAsPNG() {
        if (ModelOrStroke === 0) {
            const canvas = document.querySelector('canvas');
            const link = document.createElement('a');
            link.download = `sketch-${inputValue}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } else {
            const container = document.getElementById('sketch-container');
            html2canvas(container).then((canvas) => {
                // Convert the captured content to a data URL
                const dataUrl = canvas.toDataURL();
                // Create a download link for the image
                const link = document.createElement('a');
                link.download = `sketch-${inputValue}.png`;
                link.href = dataUrl;
                // Programmatically trigger download
                link.click();
            });
        }
    }

    function shareDrawing() {
        const container = document.getElementById('sketch-container');
        html2canvas(container).then((canvas) => {
            // Convert the captured content to a data URL
            const dataUrl = canvas.toDataURL();

            // Write data URL to clipboard
            navigator.clipboard
                .writeText(dataUrl)
                .then(() => {
                    console.log('Data URL copied to clipboard:', dataUrl);
                    setCopySuccess(true);
                    setTimeout(() => {
                        setCopySuccess(false);
                    }, 2500); // Hide message after 5 seconds
                })
                .catch((error) => {
                    console.error('Error copying data URL to clipboard:', error);
                    alert('Failed to copy data URL to clipboard. Please try again.');
                });
        });
    }

    function redrawSketch() {
        console.log('Redrawing sketch...');
        setRerenderFlag((prev) => prev + 1);
    }

    return (
        <>
            <div className="relative h-full">
                <div
                    id="sketch-container"
                    className="h-full border-4 rounded-xl border-black"
                />
                {feedbackVisible && (
                    <>
                        <FaDownload
                            className="absolute bottom-0 right-0 text-gray-500 hover:text-black text-3xl mb-4 mr-28 cursor-pointer"
                            onClick={downloadAsPNG}
                            title="Download as PNG"
                        />
                        <FaShareAlt
                            className="absolute bottom-0 right-0 text-gray-500 hover:text-black text-3xl mb-4 mr-16 cursor-pointer"
                            onClick={shareDrawing}
                            title="Copy to clipboard"
                        />
                        <FaRedo
                            className="absolute bottom-0 right-0 text-gray-500 hover:text-black text-3xl mb-4 mr-4 cursor-pointer"
                            onClick={redrawSketch}
                            title="Redraw Sketch"
                        />
                        {copySuccess && (
                            <div className="absolute bottom-0 left-0 mb-4 ml-8 text-white bg-green-500 px-2 py-1 rounded">
                                Copied to clipboard!
                            </div>
                        )}
                    </>
                )}
            </div>
            {feedbackVisible && <Feedback inputValue={inputValue} />}
        </>
    );
};

export default Sketch;
