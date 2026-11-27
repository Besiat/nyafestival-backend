import { Repository } from 'typeorm';
import { ScheduleService } from './schedule.service';
import { ScheduleItem } from '../entity/festival/schedule-item.entity';
import { ScheduleContainer } from '../entity/festival/schedule-container.entity';

describe('ScheduleService sequence numbers', () => {
    const setup = (lastAssignedSequenceNumber: number | null) => {
        const container = { scheduleContainerId: 'container', timeMode: 'calculated', lastAssignedSequenceNumber };
        const query = {
            innerJoin: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(), addOrderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([{ scheduleItemId: 'first' }, { scheduleItemId: 'second' }]),
        };
        const manager = {
            findOne: jest.fn().mockResolvedValue(container),
            createQueryBuilder: jest.fn().mockReturnValue(query),
            update: jest.fn(), save: jest.fn(),
            getRepository: jest.fn().mockReturnValue({ maximum: jest.fn().mockResolvedValue(2) }),
        };
        const items = { manager: { transaction: callback => callback(manager) }, create: jest.fn().mockReturnValue({}) };
        const blocks = { findOne: jest.fn().mockResolvedValue({ scheduleContainerId: 'container' }) };
        const service = new ScheduleService(items as unknown as Repository<ScheduleItem>, blocks as never, null, null, null);
        return { service, manager, container, query };
    };

    it('assigns numbers once and does not renumber a locked schedule', async () => {
        const { service, manager, container } = setup(null);
        await service.setSequenceNumbersLocked('container', true);
        expect(manager.update).toHaveBeenNthCalledWith(1, ScheduleItem, 'first', { assignedSequenceNumber: 1 });
        expect(manager.update).toHaveBeenNthCalledWith(2, ScheduleItem, 'second', { assignedSequenceNumber: 2 });
        expect(container.lastAssignedSequenceNumber).toBe(2);
        await service.setSequenceNumbersLocked('container', true);
        expect(manager.update).toHaveBeenCalledTimes(2);
    });

    it('resets only the selected container', async () => {
        const { service, manager, container } = setup(44);
        await service.setSequenceNumbersLocked('container', false);
        expect(manager.update).toHaveBeenCalledWith(ScheduleItem, { scheduleContainerId: 'container' }, { assignedSequenceNumber: null });
        expect(container.lastAssignedSequenceNumber).toBeNull();
    });

    it('issues a new number beyond the last issued number, even after deletion', async () => {
        const { service, manager, container } = setup(44);
        await service.createScheduleItem('block', undefined, 'New performance');
        expect(container.lastAssignedSequenceNumber).toBe(45);
        expect(manager.save).toHaveBeenLastCalledWith(expect.objectContaining({ assignedSequenceNumber: 45, order: 3 }));
        expect(manager.findOne).toHaveBeenCalledWith(ScheduleContainer, expect.objectContaining({ lock: { mode: 'pessimistic_write' } }));
    });
});
