import { BadRequestException } from '@nestjs/common';

const classIds = new Set(['druid', 'bard', 'barbarian', 'rogue', 'fighter', 'wizard']);
const stationIds = new Set(['station-01', 'station-02', 'station-03', 'station-04', 'station-05']);
const object = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
const keysAllowed = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).every(key => keys.includes(key));
const integer = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;

export const validateQuestSnapshot = (body: unknown): { revision: number; snapshot: Record<string, unknown> } => {
    if (!object(body) || !keysAllowed(body, ['revision', 'snapshot']) || !integer(body.revision, 1, 2147483647) || !object(body.snapshot)) {
        throw new BadRequestException('Invalid quest snapshot');
    }
    const snapshot = body.snapshot;
    if (JSON.stringify(snapshot).length > 8192 || !keysAllowed(snapshot, ['classId', 'inspired', 'stations', 'rewardClaimed']) ||
        (snapshot.classId !== undefined && (typeof snapshot.classId !== 'string' || !classIds.has(snapshot.classId))) ||
        typeof snapshot.inspired !== 'boolean' || typeof snapshot.rewardClaimed !== 'boolean' || !object(snapshot.stations)) {
        throw new BadRequestException('Invalid quest snapshot');
    }
    for (const [id, station] of Object.entries(snapshot.stations)) {
        if (!stationIds.has(id) || !object(station) || !keysAllowed(station, ['visited', 'roll']) || station.visited !== true) {
            throw new BadRequestException('Invalid quest snapshot');
        }
        if (station.roll !== undefined) {
            const roll = station.roll;
            if (!object(roll) || !keysAllowed(roll, ['die', 'modifier', 'inspiration', 'total', 'outcome']) ||
                !integer(roll.die, 1, 20) || !integer(roll.modifier, -20, 20) || !integer(roll.inspiration, 0, 20) ||
                !integer(roll.total, -20, 60) || !integer(roll.outcome, 0, 2)) {
                throw new BadRequestException('Invalid quest snapshot');
            }
        }
    }
    return { revision: body.revision as number, snapshot };
};
