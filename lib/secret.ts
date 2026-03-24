import { HeroData } from "./data";

const games = new Map<string, any>();

function getRandomHero() {
  return HeroData[Math.floor(Math.random() * HeroData.length)];
}

// Get or create hero for a specific game
export function getSecretHero(gameId: string) {
  if (!games.has(gameId)) {
    games.set(gameId, getRandomHero());
  }
  return games.get(gameId);
}

// Pick new hero for a specific game
export function pickNewSecretHero(gameId: string) {
  const current = games.get(gameId) || getRandomHero();

  let newHero = current;
  while (newHero.name === current.name) {
    newHero = getRandomHero();
  }

  games.set(gameId, newHero);
  return newHero;
}