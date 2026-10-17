export class ApplicationScheduleAssignmentDTO {
    scheduleItemId: string;

    scheduleContainerId: string;

    containerCode: string;

    containerName: string;

    blockId: string;

    blockName: string;

    blockNumber?: number;

    time?: string;

    endTime?: string;

    label: string;

    order: number;
}
