import GuessRow from "./guessRow";

type Entry = {
    guess: string;
    result: Record<string, "Correct" | "Incorrect" | "Partially Correct">;
}

type Props = {  
    history: Entry[];
}

export default function GuessGrid({ history }: Props) {
    return (
        <div className="mt-8 w-full max-w-md">
            {history.map((entry, index) => (
                <GuessRow 
                key={index} 
                guess={entry.guess} 
                result={entry.result} />
            ))}
        </div>
    );
}   
