import { HeroData } from "./data";

let secretHero = HeroData[Math.floor(Math.random() * HeroData.length)];

export function getSecretHero() {
  return secretHero;
}

// Pick a new secret hero (updates the server state)
export function pickNewSecretHero() {
  let newHero = secretHero;
  while (newHero.name === secretHero.name) {
    newHero = HeroData[Math.floor(Math.random() * HeroData.length)];
  }
  secretHero = newHero;
  return secretHero;
}