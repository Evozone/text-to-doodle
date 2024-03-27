import React, { useState, useEffect } from 'react';

export default function SubmitMessage({ loading }) {
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
        <div>
            {loading && (
                <p className="mt-2 text-xl text-white">{submitMessages[messageIndex]}</p>
            )}
        </div>
    );
}
