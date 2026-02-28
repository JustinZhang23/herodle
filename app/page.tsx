"use client"

import { useState, useEffect } from 'react';
import image from 'next/image';

export default function Home() {
    const [guessInput, setGuessInput] = useState("");
    const [history, setHistory] = useState<any[]>([])
    const [names, setNames] = useState<string[]>([])
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [showHowTo, setShowHowTo] = useState(false)
    const [gameWon, setGameWon] = useState(false)

    async function handleGuess() {
        if (gameWon) return;
        const trimmed = guessInput.trim();
        // Check if input is empty or not a valid hero name
        if (!trimmed || !names.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
            return;
        }
        if (history.some(h => String(h.guess).toLowerCase() === trimmed.toLowerCase())) {
            // already guessed
            return;
        }

        const response = await fetch('/api/guess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: trimmed })
        });

        const data = await response.json();
        const newEntry = { guess: data.guess ?? trimmed, result: data };
        setHistory([newEntry, ...history]);
        // remove guessed name from suggestions/names list
        setNames(prev => prev.filter(n => n.toLowerCase() !== trimmed.toLowerCase()));
        setSuggestions([]);
        setShowSuggestions(false);
        setGuessInput("");
        // check winning
        if (data?.comparisonResult?.name === "Correct") {
            setGameWon(true);
        }
    }

    useEffect(() => {
        let mounted = true
        fetch('/api/heroes')
            .then(r => r.json())
            .then(data => {
                if (!mounted) return
                setNames(data.names || [])
            })
            .catch(() => { })
        return () => { mounted = false }
    }, [])

    const formatValue = (v: any) => {
        if (v === null || v === undefined) return "-";
        const s = String(v);
        return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }

    return (
        <main 
            className="flex flex-col items-center justify-center min-h-screen py-2 text-xl text-white"
            style={{
                backgroundImage: 'url(/idleheroes.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* logo header */}
            <div className="mb-0">
                <img src="/herodle.png" alt="Herodle" className="w-auto h-48 sm:h-56 md:h-64 lg:h-72" />
            </div>

            {!gameWon ? (
            <div className="relative flex flex-col items-center gap-3 mb-4 w-full max-w-md">
                <p className="text-4xl font-semibold text-center">Guess today's Hero</p>
                <div className="w-full flex items-center gap-3">
                    <input
                        value={guessInput}
                        onChange={(e) => {
                            const v = e.target.value
                            setGuessInput(v)
                            if (v.trim().length === 0) {
                                setSuggestions([])
                                setShowSuggestions(false)
                                return
                            }
                            const filtered = names
                                .filter(n => n.toLowerCase().includes(v.toLowerCase()))
                                .slice(0, 6)
                            setSuggestions(filtered)
                            setShowSuggestions(filtered.length > 0)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleGuess()
                            }
                        }}
                        placeholder="Enter Hero name"
                        className="border p-2 flex-1"
                        disabled={gameWon}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        onFocus={() => setShowSuggestions(suggestions.length > 0)}
                    />
                    <button onClick={handleGuess} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={gameWon}>
                        Guess
                    </button>
                </div>

                {showSuggestions && (
                    <ul className="absolute left-0 top-full mt-1 w-full max-h-48 overflow-auto bg-white border shadow z-20">
                        {suggestions.map((s, i) => (
                            <li
                                key={i}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900"
                                onMouseDown={(ev) => { ev.preventDefault(); setGuessInput(s); setShowSuggestions(false); }}
                            >{s}</li>
                        ))}
                    </ul>
                )}

            </div>
            ) : (
                <div className="mb-2 text-2xl text-green-300 font-semibold text-center">
                    You got it in {history.length} guess{history.length === 1 ? '' : 'es'}!
                </div>
            )}

            {history.length > 0 && (
            <div className="mt-2 w-full max-w-xl">
                {/* Column titles */}
                <div className="grid grid-cols-5 gap-2 text-base font-semibold text-white-700 mb-3">
                    <div className="text-center">Name</div>
                    <div className="text-center">Faction</div>
                    <div className="text-center">Class</div>
                    <div className="text-center">Star</div>
                    <div className="text-center">Effect</div>
                </div>

                {history.map((entry, index) => {
                    const res = entry.result.comparisonResult;

                    const statusClass = (status: string) => {
                        if (status === "Correct") return "bg-green-600 text-white";
                        if (status === "Partially Correct") return "bg-yellow-400 text-black";
                        return "bg-red-500 text-white";
                    }

                    return (
                        <div key={index} className="mb-3">
                            {/* Row of boxes for each attribute (grid items stretch to match tallest cell) */}
                            <div className="grid grid-cols-5 gap-2 items-stretch">
                                <div className={`w-full border flex items-center justify-center ${statusClass(res.name)} text-center px-2 py-3`}>
                                    <span className="truncate text-base font-medium">{formatValue(entry.guess?.name)}</span>
                                </div>

                                <div className={`w-full border flex items-center justify-center ${statusClass(res.faction)} text-center px-2 py-3`}>
                                    <span className="truncate text-base">{formatValue(entry.guess?.faction)}</span>
                                </div>

                                <div className={`w-full border flex items-center justify-center ${statusClass(res.class)} text-center px-2 py-3`}>
                                    <span className="truncate text-base">{formatValue(entry.guess?.class)}</span>
                                </div>

                                <div className={`w-full border flex items-center justify-center ${statusClass(res.star)} text-center px-2 py-3`}>
                                    <span className="text-base">{formatValue(entry.guess?.star)}</span>
                                </div>

                                <div className={`w-full border flex flex-col items-center justify-center ${statusClass(res.effect)} text-center px-3 py-3`}>
                                    <div className="whitespace-normal text-base text-center w-full">
                                        {String(entry.guess?.effect ?? "").split(",").map((part: string, i: number) => (
                                            <div key={i}>{formatValue(part.trim())}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            )}

            {/* how to play section below results */}
            <div className="mt-6 w-full max-w-2xl text-center mx-auto">
                <button
                    className="text-white-600 underline text-3xl"
                    onClick={() => setShowHowTo((prev) => !prev)}
                >
                    {showHowTo ? 'Hide' : 'How to Play'}
                </button>
                {showHowTo && (
                    <div className="text-xl mt-2 bg-transparent p-2 rounded mx-auto text-left leading-relaxed text-white">
                        <p>The objective of this game is to guess the <strong>HOTD</strong> (Hero of the Day) based on the stats and hints provided throughout the game.</p>
                        <p className="mt-2">For every hero submitted, each attribute will appear as green, yellow, or red depending on how close it is to the attributes of the HOTD.</p>
                        <p className="mb-4">
                            <ul className="list-disc ml-4 space-y-1 mt-2">
                                <li><span className="text-green-600 font-bold">Green</span> means the attribute is identical to that of the HOTD.</li>
                                <li><span className="text-yellow-500 font-bold">Yellow (only for Effect)</span> means the guessed hero shares an effect or effects with the HOTD, indicating that there's an overlap. Ex: If the HOTD is Betty (DoT and Control) and you guess Onkirimaru (DoT), the effect box will be yellow.</li>
                                <li><span className="text-red-600 font-bold">Red</span> means that the attribute is wrong. There are no arrows for numerical stats; a red box indicates a complete mismatch.</li>
                            </ul>
                        </p>


                        <p className="mb-4">
                            <strong>Faction</strong> can help tell what origin the hero belongs to. Factions include Abyss, Shadow, Forest, Fortress, Light, Dark, and Trans (Transcendence).
                        </p>
                        <p className="mb-4">
                            <strong>Class</strong> tells you the hero's role in combat. Classes include Warrior, Mage, Ranger, Assassin, and Priest.
                        </p>


                        <p className="mb-4">
                            <strong>Star Level</strong> indicates the hero's base power. Only <strong>Base Forms</strong> are allowed in the game. 4-star heroes forged to 5-star are not included, nor are Dummies.
                        </p>

                        <p className="mb-4">
                            <strong>Effects</strong> describe the hero's utility or damage type. These include Skill, DoT, Control, Mark, or None.
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-3 text-white text-xl text-center">
                Made by <a href="https://github.com/justinzhang23" className="underline" target="_blank" rel="noopener noreferrer">Justin Zhang
                </a>
            </div>
        </main>
    )
}