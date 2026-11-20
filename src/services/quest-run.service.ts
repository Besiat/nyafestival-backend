import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestRun } from '../entity/festival/quest-run.entity';
import { validateQuestSnapshot } from './quest-snapshot';

export const QUEST_2026_ID = 'nyaf2026';

@Injectable()
export class QuestRunService {
    constructor(@InjectRepository(QuestRun) private readonly runs: Repository<QuestRun>) {}

    async register(userId: string, runId: string) {
        const key = { userId, questId: QUEST_2026_ID, runId };

        // A concurrent retry must never overwrite the original server timestamp.
        // Keep the lookup key free of generated columns (including timestamps).
        await this.runs.createQueryBuilder().insert().into(QuestRun).values({ ...key }).orIgnore().updateEntity(false).execute();
        const run = await this.runs.findOneByOrFail(key);

        return {
            runId: run.runId,
            userId: run.userId,
            startConfirmedAt: run.startConfirmedAt,
        };
    }

    async saveProgress(userId: string, runId: string, body: unknown) {
        const { revision, snapshot } = validateQuestSnapshot(body);
        const key = { userId, questId: QUEST_2026_ID, runId };
        // The revision comparison and update must be atomic across concurrent requests.
        await this.runs.createQueryBuilder().update(QuestRun).set({ revision, snapshot })
            .where('"userId" = :userId AND "questId" = :questId AND "runId" = :runId', key)
            .andWhere('"revision" < :revision', { revision }).execute();
        const run = await this.runs.findOneBy(key);
        if (!run) throw new NotFoundException('Quest run not found');
        return { runId: run.runId, revision: run.revision };
    }
}
