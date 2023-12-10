import { Nomination } from "../entity/festival/nomination.entity";
import { ScheduleItemForUserDTO } from "./schedule-item-for-user.dto";

export class BlockForScheduleItemForUserDTO
{
    blockId: string;

    name: string;

    nominationId: string;

    nomination: Nomination;

    durationInSeconds: number;


    scheduleItems: ScheduleItemForUserDTO[];

    order: number;
}