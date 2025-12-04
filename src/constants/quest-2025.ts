import { Injectable } from "@nestjs/common";
import { IQuest } from "../interfaces/i-quest";

enum QuestStep {
    Start = "start",
    Init = "init",
    One = "one",
    Two = "two",
    Three = "three",
    Four = "four",
    Full = "full",
    Last = "last"
}

const questSequence: QuestStep[] = [
    QuestStep.Start,
    QuestStep.Init,
    QuestStep.One,
    QuestStep.Two,
    QuestStep.Three,
    QuestStep.Four,
    QuestStep.Full,
    QuestStep.Last
];

@Injectable()
export class Quest2025 implements IQuest {
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