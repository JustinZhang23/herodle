import { NextResponse } from "next/server";
import { findHeroByName, HeroData, getHeroImage } from "@/lib/data";
import { compareHeroes } from "@/lib/compare";

export async function POST(request: Request) {
    const { name, gameId } = await request.json();
    
    if (!gameId) {
        return NextResponse.json({ error: "Missing gameId" }, { status: 400 });
    }

    // Decode the secret hero from gameId (stateless)
    let secretHeroName: string;
    try {
        secretHeroName = JSON.parse(atob(gameId));
    } catch (e) {
        return NextResponse.json({ error: "Invalid gameId" }, { status: 400 });
    }

    const guessHero = findHeroByName(name);
    const secretHero = HeroData.find(h => h.name === secretHeroName);

    if (!guessHero) {
        return NextResponse.json({ error: "Hero not found" }, { status: 400 });
    }
    if (!secretHero) {
        return NextResponse.json({ error: "Secret hero not found" }, { status: 400 });
    }

    console.log("Decoded secret hero:", secretHero.name);

    const result = compareHeroes(guessHero, secretHero);
    const secretImage = getHeroImage(secretHero.name);

    return NextResponse.json({
        comparisonResult: result,
        secretImage,
        guess: guessHero,
    });
}