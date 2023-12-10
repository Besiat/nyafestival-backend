import { BlockForScheduleItemForUserDTO } from "./block-for-schedule-item-for-user.dto";

export class ScheduleItemForUserDTO {
    scheduleItemId: string;

    name: string;

    blockId: string;

    block: BlockForScheduleItemForUserDTO;

    applicationId: string;

    order: number;

    liked: boolean;
} 