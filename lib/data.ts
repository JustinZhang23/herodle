import heroes from "./heroes.json"
import { Hero } from "./types";

export const heroData : Hero[] = heroes
export const HeroData = heroData

export function findHeroByName(name : string) : Hero | undefined {
    return heroData.find(
        hero => hero.name.toLowerCase() === name.toLowerCase()
    )
}

export function getHeroImage(name : string){
    return '/heroes/' + name.toLowerCase().replace(/\s/g, '') + '.png'
}