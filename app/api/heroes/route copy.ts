import { NextResponse } from "next/server";
import { HeroData }  from "@/lib/data";

export async function GET() {
    const names  = HeroData.map(hero => hero.name);

    return NextResponse.json({ names });
}