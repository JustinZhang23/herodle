import { NextResponse } from "next/server";
import { findHeroByName } from "@/lib/data";             
import { getSecretHero } from "@/lib/secret";
import { compareHeroes } from "@/lib/compare";
import { getHeroImage } from "@/lib/data";

const secretHero = getSecretHero();

export async function POST(request: Request) {
    const { name } = await request.json();

    const guessHero = findHeroByName(name);

    if (!guessHero) {
        return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    const result = compareHeroes(guessHero, secretHero);
    const secretImage = getHeroImage(secretHero.name);
    return NextResponse.json({ comparisonResult: result, secretImage });    
}   