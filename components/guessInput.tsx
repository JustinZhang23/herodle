"use client"

import { useState } from 'react';

type Props = {
    onGuess: (guess: string) => void;
}

export default function GuessInput({ onGuess }: Props) {
    const [guessInput, setGuessInput] = useState("");
    
    function handleGuess() {
        if (guessInput.trim() === "") return;
        onGuess(guessInput);
        setGuessInput("");
    }

    return (
        <div className="flex flex-col items-center">
            <input
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Enter Hero name"
                className="border p-2 mb-4 w-64"
            />
            <button onClick={handleGuess} className="bg-blue-500 text-white px-4 py-2 rounded">
                Guess
            </button>
        </div>
    );
}