import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserQuestProgress } from "../entity/festival/user-quest.entity";
import { Repository } from "typeorm";

@Injectable()
export class QuestRepository {

    constructor(@InjectRepository(UserQuestProgress) private questRepository: Repository<UserQuestProgress>) { }

    async getUserQuestProgress(userId: string, questCode: string) {
        const userQuest = await this.questRepository.findOne({where: {userId, questCode}});
        return await this.questRepository.findOne({where: {userId, questCode}});
    }

    async saveUserQuestProgress(userQuest: UserQuestProgress) {
        return await this.questRepository.save(userQuest);
    }
}