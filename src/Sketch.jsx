import { useEffect, useState } from 'react';
import * as ms from '@magenta/sketch';

const Sketch = ({ inputValue }) => {
    const [model, setModel] = useState(null);
    const [modelLoaded, setModelLoaded] = useState(false);

    useEffect(() => {
        // Load the model on component mount or object change
        const loadModel = async () => {
            console.log('Loading model...');
            try {
                const newModel = new ms.SketchRNN(
                    `https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/${inputValue}.gen.json`
                );
                await newModel.initialize();
                newModel.setPixelFactor(3.0);
                setModel(newModel);
                setModelLoaded(true);
                console.log('SketchRNN model loaded.');
            } catch (error) {
                alert('Some error occured while loading the model. Please try again.');
                console.error('Error loading model:', error);
            }
        };

        if (inputValue) {
            loadModel();
        }

        return () => {
            // Cleanup function when the component unmounts (optional)
        };
    }, [inputValue]);

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
                    const screenWidth = Math.floor(containerSize.width);
                    const screenHeight = Math.floor(containerSize.height) - 8;
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

    return (
        <>
            <div id="sketch-container" className="h-full border-4 border-black" />
            {
                // Show loading message if model is not loaded
                modelLoaded && (
                    <button
                        type="button"
                        className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                        onClick={() => {
                            setModel(null); // Unload the model
                            setModelLoaded(false); // Reset model loaded state

                            // Clear the canvas
                            const canvas = document.querySelector('canvas');
                            const context = canvas.getContext('2d');
                            context.clearRect(0, 0, canvas.width, canvas.height);

                            // unmount the canvas
                            canvas.remove();
                        }}
                    >
                        Clear
                    </button>
                )
            }
        </>
    );
};

export default Sketch;
