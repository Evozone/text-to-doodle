import { useState } from 'react';
import Sketch from './Sketch';

function App() {
    const [input, setInput] = useState('');
    const [inputValue, setInputValue] = useState(''); // Default value ['cat'

    const handleInputSubmit = () => {
        if (!input) {
            alert('Please enter some input');
            return;
        }
        console.log(input);
        setInputValue(input);
    };

    return (
        <div className="p-1 m-10 bg-white shadow-lg flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="basis-1/2 bg-blue-800 h-full mr-1">
                <p>yo</p>
                <Sketch inputValue={inputValue} />
            </div>

            <div className="basis-1/2 bg-blue-300">
                <h1 className="title">Turtle da Vinci</h1>
                <input
                    type="text"
                    id="input"
                    placeholder="Type some turtle code here"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={handleInputSubmit}>Draw </button>
            </div>
        </div>
    );
}

export default App;
