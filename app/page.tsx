"use client"

import { useState, useEffect } from 'react';
import image from 'next/image';


export default function Home() {
    const [gameId, setGameId] = useState<string | null>(null);
    const [guessInput, setGuessInput] = useState("");
    const [history, setHistory] = useState<any[]>([])
    const [names, setNames] = useState<string[]>([])
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [showHowTo, setShowHowTo] = useState(false)
    const [gameWon, setGameWon] = useState(false)

    async function handleGuess() {
        if (gameWon || !gameId) return;        
        
        const trimmed = guessInput.trim();

        if (!trimmed || !names.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
            return;
        }

        if (history.some(h => String(h.guess).toLowerCase() === trimmed.toLowerCase())) {
            return;
        }

        const response = await fetch('/api/guess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmed, gameId }),
        });

        const data = await response.json();
        const newEntry = { guess: data.guess ?? trimmed, result: data };

        setHistory([newEntry, ...history]);
        setNames(prev => prev.filter(n => n.toLowerCase() !== trimmed.toLowerCase()));
        setSuggestions([]);
        setShowSuggestions(false);
        setGuessInput("");

        if (data?.comparisonResult?.name === "Correct") {
            setGameWon(true);
        }
    }

    async function handleNewHero() {
        try {
            // Request a new hero and get the new gameId
            const res = await fetch("/api/new-heroes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId })
            });

            const data = await res.json();
            if (!data.gameId) throw new Error("No gameId returned");

            // Update localStorage and state with the new gameId
            localStorage.setItem("gameId", data.gameId);
            setGameId(data.gameId);

            // Reset game state
            setHistory([]);
            setGameWon(false);
            setGuessInput("");
            setSuggestions([]);
            setShowSuggestions(false);

            // Refresh available hero names
            const heroRes = await fetch("/api/heroes");
            const heroData = await heroRes.json();
            setNames(heroData.names || []);
        } catch (err) {
            console.error("Failed to get new hero", err);
        }
    }

    useEffect(() => {
    fetch("/api/heroes")
        .then(res => res.json())
        .then(data => {
            setNames(data.names || []);

            let id = localStorage.getItem("gameId");

            let valid = false;
            if (id) {
                try {
                    JSON.parse(atob(id));
                    valid = true;
                } catch {
                    valid = false;
                }
            }

            // If invalid (old UUID), generate new one
            if (!valid && data.names.length > 0) {
                const hero = data.names[Math.floor(Math.random() * data.names.length)];
                id = btoa(JSON.stringify(hero));
                localStorage.setItem("gameId", id);
            }

            setGameId(id);
        });
}, []);

    const formatValue = (v: any) => {
        if (v === null || v === undefined) return "-";
        const s = String(v);
        return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }

    const statusClass = (status: string) => {
        if (status === "Correct") return "bg-gradient-to-br from-green-700 to-green-400 text-white";
        if (status === "Partially Correct") return "bg-gradient-to-br from-yellow-700 to-yellow-400 text-white";
        return "bg-gradient-to-br from-red-700 to-red-400 text-white";
    }

    const formatMechanicList = (value: any) => {
        if (!value || String(value).trim() === "") return ["None"];
        return String(value)
            .split(",")
            .map((v: string) => v.trim())
            .filter((v: string) => v.length > 0);
    };

    return (
        <main
            className="flex flex-col items-center justify-center min-h-screen py-2 text-[clamp(0.9rem,1.2vw,1.2rem)] text-white"
        >

            <div className="fixed inset-0 -z-10">
                <img
                    src="/IdleHeroes.png"
                    className="w-full h-full object-cover"
                    alt="background"
                />
                <div className="absolute inset-0"></div>
            </div>

            {/* Logo */}
            <div>
                <img src="/Herodle.png" alt="Herodle" className="w-auto h-48 sm:h-56 md:h-64 lg:h-72" />
            </div>

            {!gameWon ? (
                <div className="relative flex flex-col items-center gap-3 mb-4 w-full max-w-md">

                    {/* Title */}
                    <p className="bg-gradient-to-b from-yellow-200 to-red-700 inline-block text-transparent bg-clip-text text-[clamp(1.5rem,4vw,2.5rem)] font-bold">
                        Guess the Idle Hero
                    </p>

                    <div className="w-[85%] flex items-center gap-3">
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
                            className="border p-2 flex-1 bg-black/20 py-1 px-3 rounded-full text-[clamp(0.8rem,1.2vw,1rem)] text-[16px]"
                            disabled={gameWon}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            onFocus={() => setShowSuggestions(suggestions.length > 0)}
                        />
                        <button
                            onClick={handleGuess}
                            className="bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-full text-[clamp(0.8rem,1.2vw,1rem)]"
                            disabled={gameWon}
                        >
                            Guess
                        </button>
                    </div>

                    {showSuggestions && (
                        <ul className="absolute left-0 top-full mt-1 w-full max-h-48 overflow-auto bg-white border shadow z-20">
                            {suggestions.map((s, i) => (
                                <li
                                    key={i}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-[clamp(0.7rem,1vw,0.9rem)] text-gray-900"
                                    onMouseDown={(ev) => {
                                        ev.preventDefault();
                                        setGuessInput(s);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-transparent bg-clip-text font-semibold text-center leading-tight text-[clamp(1rem,2vw,1.3rem)]">
                        Solved in {history.length} guess{history.length === 1 ? '' : 'es'}!
                    </div>

                    <button
                        onClick={handleNewHero}
                        className="bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-full shadow-md text-[clamp(0.8rem,1.2vw,1rem)]"
                    >
                        Try Another Hero
                    </button>
                </div>
            )}

            {history.length > 0 && (
                <div className="mt-2 w-full max-w-xl">

                    {/* Column Titles */}
                    <div className="grid grid-cols-6 gap-2 font-semibold text-[clamp(0.7rem,1.2vw,1rem)]">
                        {["Name", "Faction", "Class", "Dot", "Control", "Misc"].map((label, colIndex) => (
                            <div
                                key={label}
                                style={{ animationDelay: `${colIndex * 120}ms` }}
                                className="text-center bg-black/25 px-2 py-1 rounded-full animate-drop">
                                {label}
                            </div>
                        ))}
                    </div>

                    {history.map((entry, index) => {
                        const res = entry.result.comparisonResult ?? {
                            name: "",
                            faction: "",
                            class: "",
                            dot: "",
                            control: "",
                            misc: "",

                        };
                        const rowKey = `${entry.guess?.name ?? index}-${history.length}`;

                        return (
                            <div key={rowKey} className="mb-2">
                                <div
                                    className="grid grid-cols-6 gap-2 items-stretch w-full"
                                    style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>

                                    {["name", "faction", "class"].map((key, colIndex) => {
                                        const isNewest = index === 0;
                                        return (
                                            <div
                                                key={key}
                                                style={isNewest ? { animationDelay: `${colIndex * 120}ms` } : {}}
                                                className={`${isNewest ? "animate-drop" : ""} flex items-center justify-center min-w-0 ${statusClass(res[key])} text-center px-2 py-3 rounded-xl shadow-md`}
                                            >
                                                <span className="truncate">
                                                    {formatValue(entry.guess?.[key])}
                                                </span>
                                            </div>
                                        );
                                    })}

                                    {["dot", "control", "misc"].map((key, colIndex) => {
                                        const isNewest = index === 0;
                                        return (
                                            <div
                                                key={key}
                                                style={isNewest ? { animationDelay: `${(colIndex + 3) * 120}ms` } : {}}
                                                className={`${isNewest ? "animate-drop" : ""} flex flex-col items-stretch justify-center overflow-hidden min-w-0 ${statusClass(res[key])} text-center px-3 py-3 rounded-xl shadow-md`}
                                            >
                                                <div className="w-full min-w-0">
                                                    {formatMechanicList(entry.guess?.[key]).map((part: string, i: number) => (
                                                        <div key={i} className="truncate block w-full min-w-0 unbreakable">
                                                            {formatValue(part)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* How To Play */}
            <div className="mt-6 w-full max-w-lg text-center">
                <button
                    className="hover:underline text-[clamp(0.9rem,1.5vw,1.1rem)]"
                    onClick={() => setShowHowTo((prev) => !prev)}
                >
                    {showHowTo ? 'Hide' : 'How to Play'}
                </button>

                {showHowTo && (
                    <div className="text-md mt-2 bg-black/50 p-2 rounded mx-auto text-left leading-relaxed text-white">
                        <p>The objective of this game is to guess the <strong>Idle Hero</strong> based on the stats and hints provided throughout the game.</p>
                        <p className="mt-2">For every hero submitted, each attribute will appear as green, yellow, or red depending on how close it is to the attributes of the Idle Hero.</p>
                        <ul className="list-disc ml-4 space-y-1 mt-2">
                            <li><span className="text-green-600 font-bold">Green</span> means the attribute is identical to that of the Idle Hero.</li>
                            <li><span className="text-yellow-500 font-bold">Yellow (only for Mechanic)</span> means the guessed hero shares a mechanic or mechanics with the Idle Hero,
                                indicating that there's an overlap. Ex: If the Idle Hero is Ithaqua (Poison and Bleed) and you guess Horus (Bleed), the mechanic box will be yellow.</li>
                            <li><span className="text-red-600 font-bold">Red</span> means that the attribute is wrong. A red box indicates a complete mismatch.</li>
                        </ul>

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

            <div className="mt-8 text-white-600 text-xs text-center">
                Made by
            </div>

            <div className="text-white-600 text-xs text-center">
                <a href="https://github.com/justinzhang23" className="underline" target="_blank" rel="noopener noreferrer">Justin Zhang
                </a>
            </div>

            <footer className="mt-8 text-white bg-black/20 text-sm text-center py-2 px-4 border-white/10 rounded-4xl">
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