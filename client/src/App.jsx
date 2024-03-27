import { useState } from 'react';
import Sketch from './components/Sketch';
import SubmitMessage from './components/SubmitMessage';
import UserInput from './components/UserInput';

function App() {
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    return (
        <div className="m-10 flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="basis-1/2 bg-white rounded-xl h-full mr-1">
                <Sketch inputValue={inputValue} setLoading={setLoading} />
            </div>
            <div className="basis-1/2 flex flex-col justify-center px-7">
                <h1 className="title shadow-black text-8xl text-green-900 font-bold drop-shadow-xl">
                    Turtle da Vinci
                </h1>

                <SubmitMessage {...{ loading }} />

                <UserInput {...{ setInputValue, setLoading }} />
            </div>
        </div>
    );
}

export default App;
