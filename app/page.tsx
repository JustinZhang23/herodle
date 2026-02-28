"use client"

import { useState } from 'react';
import image from 'next/image';

export default function Home() {
    const [guessInput, setGuessInput] = useState("");
    const [history, setHistory] = useState<any[]>([])

    async function handleGuess() {
        const response = await fetch('/api/guess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: guessInput })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.error)
            return
        }

        setHistory([...history, { guess: guessInput, result: data.comparisonResult }]);
        setGuessInput("");
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-4xl font-bold mb-8">Herodle!</h1>

            <input
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Enter Hero name"
                className="border p-2 mb-4 w-64"
            />
            <button onClick={handleGuess} className="bg-blue-500 text-white px-4 py-2 rounded">
                Guess
            </button>

            <div className="mt-8 w-full max-w-md">
                {history.map((entry, index) => (
                    <div key={index} className="border p-4 mb-4">
                        <img
                            src={entry.guess.Image as string} 
                            alt={entry.guess.Name as string} 
                            width={80} 
                            height={80}
                        />

                        <p>Guess: {entry.guess}</p>
                        <p>Name: {entry.result.comparisonResult.name}</p>
                        <p>Faction: {entry.result.comparisonResult.faction}</p>
                        <p>Class: {entry.result.comparisonResult.class}</p>
                        <p>Star: {entry.result.comparisonResult.star}</p>
                        <p>Effect: {entry.result.comparisonResult.effect}</p>
                    </div>
                ))}
            </div>
        </main>
    )
}