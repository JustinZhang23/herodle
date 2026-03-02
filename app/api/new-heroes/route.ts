import { NextResponse } from "next/server";
import { pickNewSecretHero } from "@/lib/secret";

export async function GET() {
  const hero = pickNewSecretHero(); // MUST call this
  console.log("New hero picked:", hero.name);
  return NextResponse.json({ success: true });
}