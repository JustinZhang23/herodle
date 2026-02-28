import { Hero } from "./types";

export type ComparisonResult = {
    [K in keyof Hero]: "Correct" | "Incorrect" | "Partially Correct"
}

export function compareHeroes(guess: Hero, secret: Hero): ComparisonResult {
    // helper splits comma-separated effects and normalizes
    const splitEffects = (s: string) =>
        s
            .split(',')
            .map((p) => p.trim().toLowerCase())
            .filter((p) => p.length > 0);

    const guessEffs = splitEffects(guess.effect);
    const secretEffs = splitEffects(secret.effect);

    let effectResult: "Correct" | "Partially Correct" | "Incorrect";
    if (
        guessEffs.length === secretEffs.length &&
        guessEffs.every((g) => secretEffs.includes(g))
    ) {
        effectResult = "Correct";
    } else if (guessEffs.some((g) => secretEffs.includes(g))) {
        effectResult = "Partially Correct";
    } else {
        effectResult = "Incorrect";
    }

    return {
        name: guess.name === secret.name ? "Correct" : "Incorrect",
        
        faction: guess.faction === secret.faction ? "Correct" : "Incorrect",
        
        class: guess.class === secret.class ? "Correct" : "Incorrect",
        
        star: guess.star === secret.star ? "Correct" : Math.abs(guess.star - secret.star) < 1 ? "Partially Correct" : "Incorrect",
        
        effect: effectResult,
    }
}

