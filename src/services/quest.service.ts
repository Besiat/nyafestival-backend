import { Inject } from "@nestjs/common";
import { IQuest } from "../interfaces/i-quest";
import { QuestRepository } from "../repositories/quest.repository";

export class QuestService {
    constructor(private readonly questRepository: QuestRepository, @Inject('IQuest') private readonly quest: IQuest) { }

    async getNextStep(userId: string, questCode: string, providedStep: string): Promise<string> {
        const userQuest = await this.questRepository.getUserQuestProgress(userId, questCode) ?? { userId, questCode, lastStep: null };
        const currentStep = userQuest?.lastStep ?? this.quest.getFirstStep();
        const nextStep = this.quest.getNextStep(currentStep, providedStep);
        if (!nextStep) {
            throw new Error('Invalid step');
        }

        this.questRepository.saveUserQuestProgress({ ...userQuest, lastStep: nextStep });
        return nextStep;
    }
}