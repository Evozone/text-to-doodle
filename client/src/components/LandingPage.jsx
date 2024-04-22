import { useEffect, useRef, useState } from 'react';
import GoogleOneTapLogin from './GoogleOneTapLogin';
import * as ms from '@magenta/sketch';
import '../index.css';

const LandingPage = ({ setNavigateHome, navigateHome, setLoading }) => {
    const [model, setModel] = useState(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [flag, setFlag] = useState(0);
    const canvasRendered = useRef(false);
    const loadModel = async (modelValue) => {
        try {
            const newModel = new ms.SketchRNN(
                `https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/${modelValue}.gen.json`
            );
            await newModel.initialize();
            // Initialize the scale factor for the model. Bigger -> large outputs
            newModel.setPixelFactor(3.0);
            setModel(newModel);
            setModelLoaded(true);
            console.log('SketchRNN model loaded of landing');
        } catch (error) {
            alert('Some error occured while loading the model. Please try again.');
            console.error('Error loading model:', error);
        }
    };
    // Load the model with initial value "flower" when component mounts
    useEffect(() => {
        if (modelLoaded) {
            setModel(null); // Unload the model
            setModelLoaded(false); // Reset model loaded state

            // Clear the canvas
            const canvas = document.querySelector('canvas');
            const context = canvas?.getContext('2d');
            context?.clearRect(0, 0, canvas.width, canvas.height);

            // unmount the canvas
            canvas.remove();
        }
        if (canvasRendered.current == false) {
            canvasRendered.current = true;
            loadModel('flower');
        }
    }, [navigateHome]);
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
                        .getElementById('sketch-container1')
                        .getBoundingClientRect();
                    const screenWidth = Math.floor(containerSize.width) - 22;
                    const screenHeight = Math.floor(containerSize.height) - 25;
                    p.createCanvas(screenWidth, screenHeight);
                    p.frameRate(60);

                    // Initial setup for drawing
                    setupNewDrawing();
                };

                p.draw = function () {
                    // console.log('Drawing at:', x, y); // Log drawing coordinates
                    if (!model) return; // Wait for model to load

                    // If we finished the previous drawing, start a new one.
                    if (previousPen[PEN.END] === 1) {
                        p.noLoop();
                        setTimeout(() => {
                            // Clear the canvas
                            const canvas = document.querySelector('canvas');
                            const context = canvas?.getContext('2d');
                            context?.clearRect(0, 0, canvas.width, canvas.height);

                            // unmount the canvas
                            canvas.remove();
                            setFlag((prev) => prev + 1);
                        }, 2000);
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

            new window.p5((p) => sketch(p), 'sketch-container1');
        }
    }, [model, flag]);
    return (
        <div className="flex h-full">
            <div className="basis-1/2 bg-white rounded-xl h-full mr-1">
                <div
                    id="sketch-container1"
                    className="h-full border-4 rounded-xl gradient-border"
                />
            </div>
            <div className="w-1/2 p-4 flex item-center flex-col">
                <p
                    className="title shadow-black text-8xl text-green-200 font-bold drop-shadow-xl mb-2"
                    style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
                >
                    turtle d<span className="text-green-300 inline">A</span> Vinc
                    <span className="text-green-300 inline">I</span>
                </p>

                <p className="tagline text-2xl text-white mb-5 mt-1">
                    🖌️ Transforming Text to Art !
                </p>
                <div className="gradient-border p-3 mb-5 bg-black">
                    <p className="text-xl text-white">
                        Fun fact: Leonardo's surname wasn't actually daVinci but rather it
                        means 'from Vinci', which is just a city from Italy. It's like
                        calling DiCaprio Leonardo da Los Angeles.
                    </p>
                </div>
                <div className="flex items-center justify-center">
                    <GoogleOneTapLogin
                        setNavigateHome={setNavigateHome}
                        setLoading={setLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
