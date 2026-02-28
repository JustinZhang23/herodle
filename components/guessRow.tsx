import Image from "next/image";

type ResultType = "Correct" | "Incorrect" | "Partially Correct"

type Props = {
    guess: string;
    result: Record<string, ResultType>;
}

function getColor(result: ResultType) {
    switch (result) {
        case "Correct":
            return "green";
        case "Partially Correct":
            return "yellow";
        case "Incorrect":
            return "red";
    }
}

export default function GuessRow({ guess, result }: Props) {
    return (
        <div className="border p-4 mb-4 flex items-center">
            <Image
                src={guess}
                alt="Hero Image"
                width={80}
                height={80} />
            <div className="ml-4">
                <p>Name: <span style={{ color: getColor(result.result) }}>{result.name}</span></p>
                <p>Faction: <span style={{ color: getColor(result.result) }}>{result.faction}</span></p>
                <p>Class: <span style={{ color: getColor(result.result) }}>{result.result}</span></p>
            </div>
        </div>
    );
}
