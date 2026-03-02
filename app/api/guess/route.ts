import { NextResponse } from "next/server";
import { findHeroByName } from "@/lib/data";             
import { getSecretHero } from "@/lib/secret";
import { compareHeroes } from "@/lib/compare";
import { getHeroImage } from "@/lib/data";

export async function POST(request: Request) {
    const body = await request.json();
    const name = body?.name;

    const guessHero = findHeroByName(name);

    const secretHero = getSecretHero();

    console.log("Current secret:", secretHero.name);
    const result = compareHeroes(guessHero, secretHero);
    const secretImage = getHeroImage(secretHero.name);

    return NextResponse.json({
        comparisonResult: result,
        secretImage,
        guess: guessHero
    });    
}