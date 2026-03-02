import { Hero } from "./types";

export type ComparisonResult = {
    [K in keyof Hero]: "Correct" | "Incorrect" | "Partially Correct"
}

export function compareHeroes(guess: Hero, secret: Hero): ComparisonResult {
    //helper splits comma-separated dot and normalizes
    const splitDoT = (s: string) =>
        s
            .split(',')
            .map((p) => p.trim().toLowerCase())
            .filter((p) => p.length > 0);

    const guessDot = splitDoT(guess.dot);
    const secretDot = splitDoT(secret.dot);

    let dotResult: "Correct" | "Partially Correct" | "Incorrect";
    if (
        guessDot.length === secretDot   .length &&
        guessDot.every((g) => secretDot.includes(g))
    ) {
        dotResult = "Correct";
    } else if (guessDot.some((g) => secretDot.includes(g))) {
        dotResult = "Partially Correct";
    } else {
        dotResult = "Incorrect";
    }

    //helper splits comma-separated control and normalizes
    const splitControl = (s: string) =>
        s
            .split(',')
            .map((p) => p.trim().toLowerCase())
            .filter((p) => p.length > 0);

    const guessControl = splitControl(guess.control);
    const secretControl = splitControl(secret.control);

    let controlResult: "Correct" | "Partially Correct" | "Incorrect";
    if (
        guessControl.length === secretControl.length &&
        guessControl.every((g) => secretControl.includes(g))
    ) {
        controlResult = "Correct";
    } else if (guessControl.some((g) => secretControl.includes(g))) {
        controlResult = "Partially Correct";
    } else {
        controlResult = "Incorrect";
    }

    //helper splits comma-separated misc and normalizes
    const splitMisc = (s: string) =>
        s
            .split(',')
            .map((p) => p.trim().toLowerCase())
            .filter((p) => p.length > 0);

    const guessMisc = splitMisc(guess.misc);
    const secretMisc = splitMisc(secret.misc);

    let miscResult: "Correct" | "Partially Correct" | "Incorrect";
    if (
        guessMisc.length === secretMisc.length &&
        guessMisc.every((g) => secretMisc.includes(g))
    ) {
        miscResult = "Correct";
    } else if (guessMisc.some((g) => secretMisc.includes(g))) {
        miscResult = "Partially Correct";
    } else {
        miscResult = "Incorrect";
    }  

    return {
        name: guess.name === secret.name ? "Correct" : "Incorrect",
        
        faction: guess.faction === secret.faction ? "Correct" : "Incorrect",
        
        class: guess.class === secret.class ? "Correct" : "Incorrect",
        
        star: guess.star === secret.star ? "Correct" : Math.abs(guess.star - secret.star) < 1 ? "Partially Correct" : "Incorrect",
        
        dot: dotResult,

        control: controlResult,

        misc: miscResult,
    }
}

