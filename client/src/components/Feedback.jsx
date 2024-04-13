import { useEffect, useState, useRef } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const Feedback = () => {
    const [likeColored, setLikeColored] = useState(false);
    const [dislikeColored, setDislikeColored] = useState(false);
    const [visible, setVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const toggleLikeColor = () => {
        if (!likeColored) setVisible(true);
        if (likeColored) setVisible(false);
        setLikeColored(!likeColored);
        setDislikeColored(false);
    };

    const toggleDislikeColor = () => {
        if (!dislikeColored) setShowModal(true);
        setVisible(false);
        setDislikeColored(!dislikeColored);
        setLikeColored(false);
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
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        const current = {
            color: 'black',
        };
        let drawing = false;
        const drawLine = (x0, y0, x1, y1, color) => {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
        };
        const onMouseDown = (e) => {
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            current.x = (e.clientX || e.touches[0].clientX) - rect.left;
            current.y = (e.clientY || e.touches[0].clientY) - rect.top;
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
        };
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
            canvas.width = 800;
            canvas.height = 600;
        };

        window.addEventListener('resize', onResize);
        onResize();

        return () => {};
    }, [showModal]);

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
            {showModal ? (
                <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div className="relative w-auto my-6 mx-auto max-w-6xl">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                {/*header*/}
                                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                    <h3 className="text-3xl font-semibold">
                                        Remake Request: Can You Draw It Better Than AI?
                                    </h3>
                                    <button
                                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                            ×
                                        </span>
                                    </button>
                                </div>
                                {/*body*/}
                                <div className="relative p-6 flex-auto">
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={200}
                                    ></canvas>
                                </div>
                                {/*footer*/}
                                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                    <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Submit Doodle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </>
    );
};
export default Feedback;
