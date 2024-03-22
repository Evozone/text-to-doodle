import { useState, useEffect } from 'react';
import Sketch from './Sketch';

function App() {
    const [input, setInput] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);

    const submitMessages = [
        'Polishing the pixels...',
        'Rounding up the art supplies...',
        'Warming up the artistic Neurons...',
        'Sharpening the pencils...',
        'Tickling the digital canvas...',
        'Summoning the doodle elves...',
        'Calibrating the doodle-o-meter...',
        'Applying virtual brush strokes...',
        "Muting the 'artist's block' gremlin...",
        'Mixing the digital paints...',
        'Whispering creativity into the algorithm...',
    ];

    const handleInputSubmit = () => {
        if (!input) {
            alert('Please enter some input');
            return;
        }
        console.log(input);
        setInputValue(input);
    };

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setMessageIndex((prevIndex) => (prevIndex + 1) % submitMessages.length);
            }, 2000); // Adjust the interval time as needed
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [loading, submitMessages.length]);

    return (
        <div className="m-10 shadow-lg flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="basis-1/2 bg-white rounded-xl h-full mr-1">
                <Sketch inputValue={inputValue} setLoading={setLoading} />
            </div>
            <div className="basis-1/2 flex flex-col justify-center px-7">
                <h1 className="title shadow-black text-8xl text-green-900 font-bold drop-shadow-xl">
                    Turtle da Vinci
                </h1>

                {loading && (
                    <p className="mt-2 text-xl text-white">
                        {submitMessages[messageIndex]}
                    </p>
                )}

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    type="text"
                    id="large-input"
                    className="self-start p-3 mb-8 mt-4 text-2xl text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Enter a word to draw"
                />
                <button
                    type="button"
                    className="self-start text-xl text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                    onClick={handleInputSubmit}
                >
                    Draw{' '}
                </button>
            </div>
        </div>
    );
}

export default App;
