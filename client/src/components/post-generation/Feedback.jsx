import { useEffect, useState, useRef } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import axios from 'axios';

const Feedback = ({ inputValue }) => {
    const [likeColored, setLikeColored] = useState(false);
    const [dislikeColored, setDislikeColored] = useState(false);
    const [visible, setVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [strokes, setStrokes] = useState([]);

    const toggleLikeColor = () => {
        if (!likeColored) setVisible(true);
        if (likeColored) setVisible(false);
        setLikeColored(!likeColored);
        setDislikeColored(false);
    };

    const toggleDislikeColor = () => {
        const dialog = document.querySelector('dialog');
        if (!dislikeColored) {
            dialog.showModal();
            setShowModal(true);
        }
        setVisible(false);
        setDislikeColored(!dislikeColored);
        setLikeColored(false);
    };

    const closeModal = () => {
        const dialog = document.querySelector('dialog');
        dialog.close();
        setShowModal(false);
        setDislikeColored(false);
    };

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible]);
    const canvasRef = useRef(null);

    useEffect(() => {
        // Canvas Config
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        const current = {
            color: 'black',
        };
        let drawing = false;
        let xdraw = [];
        let ydraw = [];

        // Helper Function
        const drawLine = (x0, y0, x1, y1, color) => {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
        };

        // Mouse Actions
        const onMouseDown = (e) => {
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            current.x = (e.clientX || e.touches[0].clientX) - rect.left;
            current.y = (e.clientY || e.touches[0].clientY) - rect.top;
            xdraw = [Math.round(current.x)];
            ydraw = [Math.round(current.y)];
        };
        const onMouseMove = (e) => {
            if (!drawing) {
                return;
            }
            const rect = canvas.getBoundingClientRect();
            drawLine(
                current.x,
                current.y,
                (e.clientX || e.touches[0].clientX) - rect.left,
                (e.clientY || e.touches[0].clientY) - rect.top,
                current.color
            );
            current.x = (e.clientX || e.touches[0].clientX) - rect.left;
            current.y = (e.clientY || e.touches[0].clientY) - rect.top;
            xdraw.push(Math.round(current.x));
            ydraw.push(Math.round(current.y));
        };
        const onMouseUp = (e) => {
            if (!drawing) {
                return;
            }
            drawing = false;
            const rect = canvas.getBoundingClientRect();
            drawLine(
                current.x,
                current.y,
                (e.clientX || e.touches[0].clientX) - rect.left,
                (e.clientY || e.touches[0].clientY) - rect.top,
                current.color
            );
            let newStrokes = strokes;
            newStrokes.push([[xdraw], [ydraw]]);
            setStrokes(newStrokes);
        };

        // To avoid lag while drawing
        const throttle = (callback, delay) => {
            let previousCall = new Date().getTime();
            return function () {
                const time = new Date().getTime();

                if (time - previousCall >= delay) {
                    previousCall = time;
                    callback.apply(null, arguments);
                }
            };
        };

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseout', onMouseUp);
        canvas.addEventListener('mousemove', throttle(onMouseMove, 10));

        canvas.addEventListener('touchstart', onMouseDown);
        canvas.addEventListener('touchend', onMouseUp);
        canvas.addEventListener('touchcancel', onMouseUp);
        canvas.addEventListener('touchmove', throttle(onMouseMove, 10));

        const onResize = () => {
            canvas.width = 500;
            canvas.height = 500;
        };

        window.addEventListener('resize', onResize);
        onResize();

        return () => {};
    }, [showModal, strokes]);

    // Because we need to send the strokes as a string
    function arrayToString(arr) {
        let str = '[';
        for (let i = 0; i < arr.length; i++) {
            str += '[';
            for (let j = 0; j < arr[i].length; j++) {
                str += '[' + arr[i][j].join(',') + ']';
                if (j < arr[i].length - 1) {
                    str += ',';
                }
            }
            str += ']';
            if (i < arr.length - 1) {
                str += ',';
            }
        }
        str += ']';
        return str;
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        console.log(arrayToString(strokes));
        setStrokes([]);
        closeModal();
    };

    // POST
    const submitDoodle = async () => {
        await axios.post(`${import.meta.env.VITE_APP_SERVER_URL}/api/magenta/strokes`, {
            word: inputValue,
            strokes: arrayToString(strokes),
        });
        clearCanvas();
        alert('Doodle submitted successfully');
    };

    return (
        <>
            <div className="w-min px-4 py-2.5 mt-2 bg-gray-100 rounded-2xl relative">
                <div className="flex items-center">
                    <span className="mr-3 relative">
                        <FaThumbsUp
                            className={`cursor-pointer text-xl ${
                                likeColored
                                    ? 'animate-bounceUp text-blue-500'
                                    : 'text-gray-500'
                            }`}
                            onClick={toggleLikeColor}
                        />
                        <span
                            className={`absolute w-max left-1/2 bottom-full -ml-11 mb-2 p-2 bg-blue-400 text-white rounded-md ${
                                visible ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            Thanks😀
                            <span className="absolute top-full left-1/2 -mb-2 border-4 border-solid border-t-blue-400"></span>
                        </span>
                    </span>
                    <span className="border-r border-gray-700 h-6"></span>
                    <span className="ml-3">
                        <FaThumbsDown
                            className={`cursor-pointer text-xl ${
                                dislikeColored
                                    ? 'animate-bounceDown text-red-500'
                                    : 'text-gray-500'
                            }`}
                            onClick={toggleDislikeColor}
                        />
                    </span>
                </div>
            </div>

            <dialog className="rounded-md">
                <div className="flex relative w-auto mx-auto max-w-5xl">
                    {/* Left side column */}
                    <div className="flex flex-col justify-between h-auto w-80">
                        {/* Header */}
                        <div className="p-5 border-b border-solid border-blueGray-200">
                            <h3 className="text-3xl font-semibold">
                                Remake Request: Can You Draw It Better Than AI?
                            </h3>
                        </div>
                        {/* Footer */}
                        <div className="p-5 border-t border-solid border-blueGray-200">
                            <button
                                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={submitDoodle}
                            >
                                Submit Doodle
                            </button>
                            <button
                                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm border-2 border-red-500 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={clearCanvas}
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Right side square canvas */}
                    <div className="relative flex-auto bg-gray-100 cursor-crosshair">
                        <canvas ref={canvasRef} width={500} height={500}></canvas>
                    </div>
                </div>
            </dialog>
        </>
    );
};
export default Feedback;
