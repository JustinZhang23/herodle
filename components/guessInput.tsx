"use client"

import { use, useEffect, useState } from 'react';

type Props = {
    onGuess: (guess: string) => void;
}

export default function GuessInput({ onGuess }: Props) {
    const [guessInput, setGuessInput] = useState("");
    const [allHeroes, setAllHeroes] = useState<string[]>([]);
    const [filteredHeroes, setFilteredHeroes] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        async function fetchHeroes() {
            const response = await fetch('/api/heroes');
            const data = await response.json();
            setAllHeroes(data);
        }
        fetchHeroes();
    }, []);

    useEffect(() => {
        if (guessInput.trim() === "") {
            setFilteredHeroes([]);
            setShowDropdown(false);
            return;
        }
        const filtered = allHeroes.filter(hero =>
            hero.toLowerCase().includes(guessInput.toLowerCase())
        );
        setFilteredHeroes(filtered);
        setShowDropdown(true);
    }, [guessInput, allHeroes]);    

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && guessInput.trim() !== "") {
            onGuess(guessInput.trim());
            setGuessInput("");
            setShowDropdown(false);
        }
    }

    return (
        <div className="flex flex-col items-center">
            <input
                value={guessInput}
                onChange={(e) => {
                    setGuessInput(e.target.value);
                    setShowDropdown(true);
                }}
                placeholder="Enter Hero name..."
                className="border p-2 mb-4 w-64"
            />
            {showDropdown && filteredHeroes.length > 0 && (
                <div className="border w-64 max-h-40 overflow-y-auto mb-4 bg-white">
                    {filteredHeroes.map((hero, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                setGuessInput(hero);
                                setShowDropdown(false);
                            }}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                        >
                            {hero}
                        </div>
                    ))}
                </div>
            )}      
        </div>
    );
}