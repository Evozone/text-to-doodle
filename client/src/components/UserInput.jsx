import React, { useState } from 'react';
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

export default function UserInput({ setInputValue, setLoading }) {
    const [input, setInput] = useState('');
    const [hasError, setHasError] = useState(false);
    const [filterReason, setFilterReason] = useState('');

    // Obscenity setup
    const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
    });

    // Funcion to briefly flash an error message
    const brieflyFlashError = (reason) => {
        setFilterReason(reason);
        setHasError(true);
        setTimeout(() => {
            setHasError(false);
            setFilterReason('');
        }, 5000);
    };

    const filterBadWords = () => {
        return new Promise((resolve, reject) => {
            if (matcher.hasMatch(input)) {
                brieflyFlashError('Input cannot contain profanities.');
                reject(new Error('Input cannot contain profanities.'));
            } else {
                resolve();
            }
        });
    };

    const filterEnglish = () => {
        return new Promise((resolve, reject) => {
            const isEnglish = /^[a-zA-Z\s]+$/.test(input);

            if (!isEnglish) {
                brieflyFlashError('Input must be in English.');
                reject(new Error('Input must be in English.'));
            } else {
                resolve();
            }
        });
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);

        if (input.length > 50) {
            setInput(input.slice(0, 50));
        }
    };

    const handleInputSubmit = async () => {
        // Briefly show error state if input is empty
        if (input === '') {
            brieflyFlashError('Input cannot be empty.');
            return;
        }

        // Assuming this is inside an async function
        try {
            await filterBadWords();
            await filterEnglish();

            // If everything is good, then we can proceed
            if (!hasError) {
                setInputValue(input);
                setLoading(true);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div className="flex flex-col justify-center">
            <input
                value={input}
                onChange={handleInputChange}
                type="text"
                id="large-input"
                className={`self-start p-3 mb-8 mt-4 text-2xl text-gray-900 border ${
                    hasError ? 'border-red-500' : 'border-gray-300'
                } rounded-lg`}
                placeholder="Enter a word to draw"
            />
            {hasError && (
                <p className="text-red-500 text-sm font-medium mb-4 dark:text-red-400">
                    {filterReason}
                </p>
            )}
            <button
                type="button"
                className="self-start text-xl text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg px-5 py-2.5"
                onClick={handleInputSubmit}
            >
                Draw
            </button>
        </div>
    );
}
