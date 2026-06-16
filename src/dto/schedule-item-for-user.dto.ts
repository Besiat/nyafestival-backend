import { BlockForScheduleItemForUserDTO } from './block-for-schedule-item-for-user.dto';

export class ScheduleItemForUserDTO {
    scheduleItemId: string;

    name: string;

    blockId: string;

    block: BlockForScheduleItemForUserDTO;

    scheduleContainerId: string;

    applicationId?: string;

    title?: string;

    subtitle?: string;

    order: number;

    liked: boolean;
}
