import { Injectable } from "@nestjs/common";
import { IQuest } from "../interfaces/i-quest";

enum QuestStep {
    Start = "start",
    Init = "init",
    Zero = "zero",
    Twenty = "twenty",
    Forty = "forty",
    Sixty = "sixty",
    Eighty = "eighty",
    Ninetynine = "ninetynine",
    Hundred = "hundred",
    Last = "last"
}

const questSequence: QuestStep[] = [
    QuestStep.Start,
    QuestStep.Init,
    QuestStep.Zero,
    QuestStep.Twenty,
    QuestStep.Forty,
    QuestStep.Sixty,
    QuestStep.Eighty,
    QuestStep.Ninetynine,
    QuestStep.Hundred,
    QuestStep.Last
];

@Injectable()
export class Quest2024 implements IQuest {
    getFirstStep(): string {
        return QuestStep.Start;
    }

    getNextStep(currentStep: string, providedStep: string): string | null {
        const currentIndex = questSequence.indexOf(currentStep as QuestStep);
        const providedIndex = questSequence.indexOf(providedStep as QuestStep);

        if (providedIndex === currentIndex + 1) {
            return providedStep;
        }
        if (providedIndex <= currentIndex) {
            return questSequence[currentIndex];
        }

        return null;
    }

    getAllSteps(): string[] {
        return questSequence;
    }
}