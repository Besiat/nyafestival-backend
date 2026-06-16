import { Nomination } from '../entity/festival/nomination.entity';
import { ScheduleItemForUserDTO } from './schedule-item-for-user.dto';

export class BlockForScheduleItemForUserDTO {
    blockId: string;

    name: string;

    nominationId?: string;

    nomination: Nomination;

    durationInSeconds: number;

    startTime?: string;

    endTime?: string;

    scheduleContainerId: string;

    scheduleItems: ScheduleItemForUserDTO[];

    order: number;
}
