import { useEffect, useState } from 'react';
import * as ms from '@magenta/sketch';

const Sketch = ({ inputValue }) => {
    const [model, setModel] = useState(null);

    useEffect(() => {
        // Load the model on component mount or object change
        const loadModel = async () => {
            const newModel = new ms.SketchRNN(
                `https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/${inputValue}.gen.json`
            );
            await newModel.initialize();
            newModel.setPixelFactor(3.0);
            setModel(newModel);
            console.log("SketchRNN model loaded.");
        };

        if(inputValue){
            loadModel();
        }

        return () => {
            // Cleanup function when the component unmounts (optional)
        };
    }, [inputValue]);

    useEffect(() => {
        // Ensure p5.js is loaded before creating p5 instance
        if (window.p5 && model) {
            // p5 sketch logic using the model (if available)
            const sketch = (p, sampleNewState) => { // Pass sampleNewState as parameter
                let modelState = null; // Initialize modelState here
                const temperature = 0.45;
                let dx, dy; // Offsets of the pen strokes, in pixels.
                let x, y; // Absolute coordinates on the screen of where the pen is.
                let pen = [0, 0, 0]; // Current pen state, [pen_down, pen_up, pen_end].
                let previousPen = [1, 0, 0]; // Previous pen state.
                const PEN = { DOWN: 0, UP: 1, END: 2 };

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

                // Function to restart the drawing process
                function restart() {
                    [dx, dy, ...pen] = model.zeroInput(); // Reset the pen state.
                    modelState = model.zeroState(); // Reset the model state.
                    setupNewDrawing();
                }

                p.setup = function () {
                    const containerSize = document.getElementById("sketch-container").getBoundingClientRect();
                    const screenWidth = Math.floor(containerSize.width);
                    const screenHeight = p.windowHeight / 2;
                    p.createCanvas(screenWidth, screenHeight);
                    p.frameRate(60);

                    // Initial setup for drawing
                    setupNewDrawing();
                };

                p.draw = function () {
                    if (!model) return; // Wait for model to load

                    // If we finished the previous drawing, start a new one.
                    if (previousPen[PEN.END] === 1) {
                        restart();
                    }

                    // Sample new state using the provided sampleNewState function
                    [dx, dy, ...pen] = sampleNewState(model, modelState, dx, dy, pen, temperature);

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
            };

            // Define sampleNewState function
            const sampleNewState = (model, modelState, dx, dy, pen, temperature) => {
                if (!modelState) return [dx, dy, ...pen]; // Return previous state if modelState is not initialized
                // Using the previous pen states, and hidden state, get next hidden state
                modelState = model.update([dx, dy, ...pen], modelState);

                // Get the parameters of the probability distribution (pdf) from hidden state.
                const pdf = model.getPDF(modelState, temperature);

                // Sample the next pen's states from our probability distribution.
                return model.sample(pdf);
            };

            // Create p5 instance
            new window.p5((p) => sketch(p, sampleNewState), "sketch-container");

        }
    }, [model]);

    return (
        <div id="sketch-container"/>
    );
};

export default Sketch;
