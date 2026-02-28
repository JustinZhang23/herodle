import { Hero } from "./types";

export type ComparisonResult = {
    [K in keyof Hero]: "Correct" | "Incorrect" | "Partially Correct"
}

export function compareHeroes(guess: Hero, secret: Hero): ComparisonResult {
    return {
        name: guess.name === secret.name ? "Correct" : "Incorrect",
        
        faction: guess.faction === secret.faction ? "Correct" : "Incorrect",
        
        class: guess.class === secret.class ? "Correct" : "Incorrect",
        
        star: guess.star === secret.star ? "Correct" : Math.abs(guess.star - secret.star) < 1 ? "Partially Correct" : "Incorrect",
        
        effect: guess.effect === secret.effect ? "Correct" : guess.effect.includes(secret.effect) ? "Partially Correct" : "Incorrect",
    }
}

