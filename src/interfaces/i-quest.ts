export interface IQuest {
    getFirstStep(): string;
    getNextStep(currentStep: string, providedStep:string): string | null;
    getAllSteps(): string[];
}