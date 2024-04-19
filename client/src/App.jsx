import { useEffect, useState } from 'react';
import Sketch from './components/Sketch';
import SubmitMessage from './components/SubmitMessage';
import UserInput from './components/UserInput';
import LandingPage from './components/LandingPage';

function App() {
    const [navigateHome, setNavigateHome] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const auth = JSON.parse(window.localStorage.getItem('sketchApp'));
        if (auth && auth.isSignedIn) {
            setNavigateHome(true);
        }
    }, []);
    return (
        <>
            {!navigateHome ? (
                <div className="m-10 h-[calc(100vh-100px)]">
                    <LandingPage setNavigateHome={setNavigateHome} />
                </div>
            ) : (
                <div className="m-10 flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="basis-1/2 bg-white rounded-xl h-full mr-1">
                        <Sketch inputValue={inputValue} setLoading={setLoading} />
                    </div>
                    <div className="basis-1/2 flex flex-col justify-center px-5">
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

                        <SubmitMessage {...{ loading }} />

                        <UserInput {...{ setInputValue, setLoading }} />
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
