import { NextResponse } from "next/server";
import { HeroData } from "@/lib/data";

export async function POST(req: Request) {
    // Pick a random hero
    const newHero = HeroData[Math.floor(Math.random() * HeroData.length)];

    // Encode into gameId
    const newGameId = btoa(JSON.stringify(newHero.name));

    return NextResponse.json({ gameId: newGameId });
}