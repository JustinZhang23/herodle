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
        //remove guessed name from suggestions/names list
        setNames(prev => prev.filter(n => n.toLowerCase() !== trimmed.toLowerCase()));
        setSuggestions([]);
        setShowSuggestions(false);
        setGuessInput("");
        //check winning
        if (data?.comparisonResult?.name === "Correct") {
            setGameWon(true);
        }
    }

    async function handleNewHero() {
        try {
            // Call the API to pick a new hero
            await fetch("/api/new-heroes");

            // Reset local state
            setHistory([]);
            setGameWon(false);
            setGuessInput("");
            setSuggestions([]);
            setShowSuggestions(false);

            // Refresh names in case needed
            const res = await fetch("/api/heroes");
            const data = await res.json();
            setNames(data.names || []);
        } catch (err) {
            console.error("Failed to get new hero", err);
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
                    <p className="bg-gradient-to-b from-yellow-200 to-red-700 inline-block text-transparent bg-clip-text text-4xl font-bold">Guess the Idle Hero</p>
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
                            className="border p-2 flex-1 bg-black/20 py-1 px-2 rounded-4xl"
                            disabled={gameWon}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            onFocus={() => setShowSuggestions(suggestions.length > 0)}
                        />
                        <button onClick={handleGuess} className="bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-700 to-purple-700 text-white-600 px-4 py-2 rounded-4xl" disabled={gameWon}>
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
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="text-6xl bg-gradient-to-br from-blue-500 to-purple-500 flex justify-center items-center text-transparent bg-clip-text font-semibold text-center leading-tight">
                        Solved in {history.length} guess{history.length === 1 ? '' : 'es'}!
                    </div>

                    <button
                        onClick={handleNewHero}
                        className="bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-700 to-purple-700 text-white-600 px-4 py-2 rounded-4xl hover:bg-purple-700 text-white rounded-2xl shadow-md transition"
                    >
                        Try Another Hero
                    </button>
                </div>
            )}

            {history.length > 0 && (
                <div className="mt-2 w-full max-w-5xl">
                    {/* Column titles */}
                    <div className="grid grid-cols-7 gap-2 text-2xl font-semibold text-white-700">
                        <div className="text-center bg-black/25 px-4 py-1 rounded-4xl">Name</div>
                        <div className="text-center bg-black/25 px-4 py-1 rounded-4xl">Faction</div>
                        <div className="text-center bg-black/25 px-4 py-1 rounded-4xl">Class</div>
                        <div className="text-center bg-black/25 px-4 py-1 rounded-4xl">Star</div>
                        <div className="text-center bg-black/25 px-4 py-1 rounded-4xl">Dot</div>
                        <div className="text-center bg-black/25 px-4 py-1 rounded-4xl">Control</div>
                        <div className="text-center bg-black/25 px-4 py-1 rounded-4xl">Misc</div>
                    </div>

                    {history.map((entry, index) => {
                        const res = entry.result.comparisonResult;

                        const statusClass = (status: string) => {
                            if (status === "Correct") return " bg-gradient-to-br from-green-700 to-green-400 text-white";
                            if (status === "Partially Correct") return "bg-gradient-to-br from-yellow-700 to-yellow-400 text-white";
                            return "bg-gradient-to-br from-red-700 to-red-400 text-white";
                        }

                        const formatMechanicList = (value: any) => {
                            if (!value || String(value).trim() === "") {
                                return ["None"];
                            }

                            return String(value)
                                .split(",")
                                .map((v: string) => v.trim())
                                .filter((v: string) => v.length > 0);
                        };
                        return (
                            <div key={index} className="mb-2">
                                {/* Row of boxes for each attribute (grid items stretch to match tallest cell) */}
                                <div className="grid grid-cols-7 gap-2 items-stretch">
                                    <div className={`w-full flex items-center justify-center ${statusClass(res.name)} text-center px-2 py-3 rounded-xl shadow-md`}>
                                        <span className="truncate text-base font-medium">{formatValue(entry.guess?.name)}</span>
                                    </div>

                                    <div className={`w-full flex items-center justify-center ${statusClass(res.faction)} text-center px-2 py-3 rounded-xl shadow-md`}>
                                        <span className="truncate text-base">{formatValue(entry.guess?.faction)}</span>
                                    </div>

                                    <div className={`w-full flex items-center justify-center ${statusClass(res.class)} text-center px-2 py-3 rounded-xl shadow-md`}>
                                        <span className="truncate text-base">{formatValue(entry.guess?.class)}</span>
                                    </div>

                                    <div className={`w-full flex items-center justify-center ${statusClass(res.star)} text-center px-2 py-3 rounded-xl shadow-md`}>
                                        <span className="text-base">{formatValue(entry.guess?.star)}</span>
                                    </div>


                                    <div className={`w-full flex flex-col items-center justify-center ${statusClass(res.dot)} text-center px-3 py-3 rounded-xl shadow-md`}>
                                        <div className="whitespace-normal text-base text-center w-full">
                                            {formatMechanicList(entry.guess?.dot).map((part: string, i: number) => (
                                                <div key={i}>{formatValue(part)}</div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={`w-full flex flex-col items-center justify-center ${statusClass(res.control)} text-center px-3 py-3 rounded-xl shadow-md`}>
                                        <div className="whitespace-normal text-base text-center w-full">
                                            {formatMechanicList(entry.guess?.control).map((part: string, i: number) => (
                                                <div key={i}>{formatValue(part)}</div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={`w-full flex flex-col items-center justify-center ${statusClass(res.misc)} text-center px-3 py-3 rounded-xl shadow-sm`}>
                                        <div className="whitespace-normal text-base text-center w-full">
                                            {formatMechanicList(entry.guess?.misc).map((part: string, i: number) => (
                                                <div key={i}>{formatValue(part)}</div>
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
                    className="text-white-600 hover:underline text-3xl"
                    onClick={() => setShowHowTo((prev) => !prev)}
                >
                    {showHowTo ? 'Hide' : 'How to Play'}
                </button>
                {showHowTo && (
                    <div className="text-xl mt-2 bg-black/50 p-2 rounded mx-auto text-left leading-relaxed text-white">
                        <p>The objective of this game is to guess the <strong>Idle Hero</strong> based on the stats and hints provided throughout the game.</p>
                        <p className="mt-2">For every hero submitted, each attribute will appear as green, yellow, or red depending on how close it is to the attributes of the Idle Hero.</p>
                        <p className="mb-4">
                            <ul className="list-disc ml-4 space-y-1 mt-2">
                                <li><span className="text-green-600 font-bold">Green</span> means the attribute is identical to that of the Idle Hero.</li>
                                <li><span className="text-yellow-500 font-bold">Yellow (only for Mechanic)</span> means the guessed hero shares a mechanic or mechanics with the Idle Hero,
                                    indicating that there's an overlap. Ex: If the Idle Hero is Ithaqua (Poison and Bleed) and you guess Horus (Bleed), the mechanic box will be yellow.</li>
                                <li><span className="text-red-600 font-bold">Red</span> means that the attribute is wrong. A red box indicates a complete mismatch.</li>
                            </ul>
                        </p>


                        <p className="mb-4">
                            <strong>Faction</strong> can help tell what origin the hero belongs to. Factions include Abyss, Shadow, Forest, Fortress, Light, and Dark.
                        </p>

                        <p className="mb-4">
                            <strong>Class</strong> tells you the hero's role in combat. Classes include Warrior, Mage, Ranger, Assassin, and Priest.
                        </p>

                        <p className="mb-4">
                            <strong>Star Level</strong> indicates the hero's base power. Only <strong>Base Forms</strong> are allowed in the game. 4-star heroes forged to 5-star are not included, nor are Dummies.
                        </p>

                        <p className="mb-4">
                            <strong>Dot</strong> refers to damage-over-time effects such as Burn, Poison, Bleed, or other unique damage effects.<br />
                        </p>

                        <p className="mb-4">
                            <strong>Control</strong> includes crowd-control abilities like Stun, Freeze, Silence, Petrify, Taunt, and similar disabling effects.<br />
                        </p>

                        <p className="mb-0">
                            <strong>Misc</strong> covers special mechanics such as Mark, Shield, or other unique utility effects. If a hero has none in a category, it will display as <strong>None</strong>.
                        </p>

                    </div>
                )}
            </div>

            <div className="mt-4 text-white-600 text-xl text-center">
                Made by <a href="https://github.com/justinzhang23" className="underline" target="_blank" rel="noopener noreferrer">Justin Zhang
                </a>
            </div>


            <footer className="mt-4 text-white bg-black/20 text-xl text-center py-2 px-4 border-t border-white/10 rounded-4xl">
                <p>
                    Idle Heroes is developed and published by{" "}
                    <a
                        href="https://www.facebook.com/Idleheroes/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white transition"
                    >
                        DHGAMES
                    </a>.
                </p>

                <p className="mt-2">
                    This project is an unofficial, non-commercial fan-made game created for entertainment and educational purposes only.
                </p>
                <p className="mt-2">
                    It is not affiliated with, endorsed by, or sponsored by DHGAMES.
                </p>
            </footer>
        </main>
    )

}