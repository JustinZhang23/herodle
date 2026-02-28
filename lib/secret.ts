import { heroData} from "./data";

export function getSecretHero(){
    const randomIndex = Math.floor(Math.random() * heroData.length);
    return heroData[randomIndex]
}