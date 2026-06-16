import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleItem } from '../entity/festival/schedule-item.entity';
import { Application } from '../entity/festival/application.entity';
import { MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Block } from '../entity/festival/block.entity';
import { BlockForScheduleItemForUserDTO } from '../dto/block-for-schedule-item-for-user.dto';
import { StageVote } from '../entity/festival/stage-vote.entity';
import { ScheduleItemForUserDTO } from '../dto/schedule-item-for-user.dto';
import { ScheduleContainer } from '../entity/festival/schedule-container.entity';
import { ScheduleContainerDTO, UpsertScheduleContainerDTO } from '../dto/schedule-container.dto';

@Injectable()
export class ScheduleService {
    constructor(
        @InjectRepository(ScheduleItem) private readonly scheduleItemsRepository: Repository<ScheduleItem>,
        @InjectRepository(Block) private readonly blockRepository: Repository<Block>,
        @InjectRepository(ScheduleContainer) private readonly scheduleContainerRepository: Repository<ScheduleContainer>,
        @InjectRepository(Application) private readonly applicationRepository: Repository<Application>,
        @InjectRepository(StageVote) private readonly stageVoteRepository: Repository<StageVote>,
    ) {}

    async createScheduleItem(blockId: string, applicationId?: string, title?: string, subtitle?: string): Promise<void> {
        const block = await this.getBlockById(blockId);
        if (!block) throw new Error(`Block ${blockId} doesn't exist`);
        if (!applicationId && !title) throw new Error('Schedule item should have applicationId or title');
        const maxOrder = await this.scheduleItemsRepository.maximum('order', { blockId });
        const newScheduleItem = this.scheduleItemsRepository.create();

        if (applicationId) {
            const application = await this.applicationRepository.findOne({ where: { applicationId } });
            if (!application) throw new Error(`Application ${applicationId} doesn't exist`);
            const alreadyExists = await this.scheduleItemsRepository.findOne({
                where: { applicationId, scheduleContainerId: block.scheduleContainerId },
            });
            if (alreadyExists) throw new Error(`Schedule item for application ${applicationId} already exists in this container`);
            newScheduleItem.applicationId = applicationId;
            newScheduleItem.name = application.fullName;
            newScheduleItem.title = application.fullName;
        } else {
            newScheduleItem.name = title?.trim() ?? '';
            newScheduleItem.title = title?.trim() ?? '';
            newScheduleItem.subtitle = subtitle?.trim() ?? '';
        }

        newScheduleItem.blockId = blockId;
        newScheduleItem.scheduleContainerId = block.scheduleContainerId;
        newScheduleItem.order = typeof maxOrder === 'number' ? maxOrder + 1 : 0;
        await this.scheduleItemsRepository.save(newScheduleItem);
    }

    async deleteScheduleItem(scheduleItemId: string): Promise<void> {
        await this.scheduleItemsRepository.delete(scheduleItemId);
    }

    async getSchedule(userId?: string): Promise<BlockForScheduleItemForUserDTO[]> {
        const blocks = await this.getBlocksForContainerCode('main-stage');
        return this.mapBlocksToDTOs(blocks, userId);
    }

    async getScheduleContainers(userId?: string, codes?: string[]): Promise<ScheduleContainerDTO[]> {
        const query = this.scheduleContainerRepository
            .createQueryBuilder('container')
            .leftJoinAndSelect('container.blocks', 'blocks')
            .leftJoinAndSelect('blocks.scheduleItems', 'scheduleItems')
            .orderBy('container.order')
            .addOrderBy('blocks.order')
            .addOrderBy('scheduleItems.order');

        if (codes?.length) {
            query.where('container.code IN (:...codes)', { codes });
        }

        const containers = await query.getMany();
        return Promise.all(
            containers.map(async container => ({
                scheduleContainerId: container.scheduleContainerId,
                code: container.code,
                name: container.name,
                timeMode: container.timeMode,
                defaultStartTime: container.defaultStartTime,
                order: container.order,
                blocks: await this.mapBlocksToDTOs(container.blocks ?? [], userId),
            })),
        );
    }

    async getScheduleContainerList(): Promise<ScheduleContainer[]> {
        return this.scheduleContainerRepository.find({ order: { order: 'ASC' } });
    }

    async createScheduleContainer(data: UpsertScheduleContainerDTO): Promise<void> {
        const container = this.scheduleContainerRepository.create(data);
        await this.scheduleContainerRepository.save(container);
    }

    async updateScheduleContainer(scheduleContainerId: string, data: UpsertScheduleContainerDTO): Promise<void> {
        const container = await this.scheduleContainerRepository.findOne({ where: { scheduleContainerId } });
        if (!container) throw new Error(`Schedule container ${scheduleContainerId} doesn't exist`);
        container.code = data.code;
        container.name = data.name;
        container.timeMode = data.timeMode;
        container.defaultStartTime = data.defaultStartTime ?? '';
        container.order = data.order;
        await this.scheduleContainerRepository.save(container);
    }

    async deleteScheduleContainer(scheduleContainerId: string): Promise<void> {
        const blocks = await this.blockRepository.count({ where: { scheduleContainerId } });
        if (blocks > 0) throw new Error('Cannot delete schedule container with blocks');
        await this.scheduleContainerRepository.delete(scheduleContainerId);
    }

    private async getBlocksForContainerCode(code: string): Promise<Block[]> {
        return this.blockRepository
            .createQueryBuilder('block')
            .leftJoinAndSelect('block.scheduleItems', 'scheduleItems')
            .leftJoin('block.scheduleContainer', 'container')
            .where('container.code = :code', { code })
            .orderBy('block.order')
            .addOrderBy('scheduleItems.order')
            .getMany();
    }

    private async mapBlocksToDTOs(blocks: Block[], userId?: string): Promise<BlockForScheduleItemForUserDTO[]> {
        const likes = await this.stageVoteRepository.find();
        const blockDTOs = [] as BlockForScheduleItemForUserDTO[];
        for (const block of blocks) {
            const blockDTO = new BlockForScheduleItemForUserDTO();
            blockDTO.blockId = block.blockId;
            blockDTO.durationInSeconds = block.durationInSeconds;
            blockDTO.name = block.name;
            blockDTO.nomination = block.nomination;
            blockDTO.nominationId = block.nominationId;
            blockDTO.order = block.order;
            blockDTO.startTime = block.startTime;
            blockDTO.endTime = block.endTime;
            blockDTO.scheduleContainerId = block.scheduleContainerId;
            const scheduleItemDTOs = [] as ScheduleItemForUserDTO[];
            for (const scheduleItem of block.scheduleItems) {
                const scheduleItemDTO = new ScheduleItemForUserDTO();
                scheduleItemDTO.applicationId = scheduleItem.applicationId;
                //scheduleItemDTO.block = blockDTO;
                scheduleItemDTO.blockId = block.blockId;
                scheduleItemDTO.scheduleContainerId = scheduleItem.scheduleContainerId;
                scheduleItemDTO.name = scheduleItem.name;
                scheduleItemDTO.title = scheduleItem.title;
                scheduleItemDTO.subtitle = scheduleItem.subtitle;
                scheduleItemDTO.order = scheduleItem.order;
                scheduleItemDTO.scheduleItemId = scheduleItem.scheduleItemId;
                if (userId && scheduleItem.applicationId) {
                    scheduleItemDTO.liked =
                        likes.find(vote => vote.userId === userId && vote.applicationId === scheduleItem.applicationId) !== undefined;
                }
                scheduleItemDTOs.push(scheduleItemDTO);
            }
            blockDTO.scheduleItems = scheduleItemDTOs;
            blockDTOs.push(blockDTO);
        }

        return blockDTOs;
    }

    async moveScheduleItemToAnotherBlock(scheduleItemId: string, blockId: string): Promise<void> {
        const scheduleItem = await this.scheduleItemsRepository.findOne({ where: { scheduleItemId } });
        const maxOrder = await this.scheduleItemsRepository.maximum('order', { blockId });
        if (!scheduleItem) throw new Error(`Schedule item ${scheduleItem} doesn't exist`);
        const block = await this.getBlockById(blockId);
        if (!block) throw new Error(`Block ${blockId} doesn't exist`);
        scheduleItem.blockId = blockId;
        scheduleItem.scheduleContainerId = block.scheduleContainerId;
        scheduleItem.order = typeof maxOrder === 'number' ? maxOrder + 1 : 0;
        await this.scheduleItemsRepository.save(scheduleItem);
    }

    async createBlock(
        name: string,
        order: number,
        durationInSeconds?: number,
        nominationId?: string,
        scheduleContainerId?: string,
        startTime?: string,
        endTime?: string,
    ) {
        const container = await this.getScheduleContainerForBlock(scheduleContainerId);
        this.validateBlockTimes(container, durationInSeconds, startTime, endTime);
        const newBlock = this.blockRepository.create();
        newBlock.name = name;
        newBlock.nominationId = nominationId;
        newBlock.order = order;
        newBlock.durationInSeconds = durationInSeconds ?? 0;
        newBlock.scheduleContainerId = container.scheduleContainerId;
        newBlock.startTime = startTime;
        newBlock.endTime = endTime;
        await this.blockRepository.save(newBlock);
    }

    async deleteBlock(blockId: string): Promise<void> {
        await this.blockRepository.delete(blockId);
    }

    async moveBlock(blockId: string, previousBlockId?: string): Promise<void> {
        const block = await this.getBlockById(blockId);
        if (!block) {
            throw new Error(`Block ${blockId} doesn't exist`);
        }

        if (!previousBlockId) {
            await this.moveBlockToTop(block);
        } else {
            const previousBlock = await this.getBlockById(previousBlockId);
            if (!previousBlock) {
                throw new Error(`Block with id ${previousBlockId} doesn't exist`);
            }

            await this.moveBlockAfter(block, previousBlock);
        }
    }

    async updateBlock(
        blockId: string,
        name: string,
        durationInSeconds?: number,
        nominationId?: string,
        scheduleContainerId?: string,
        startTime?: string,
        endTime?: string,
    ): Promise<void> {
        const block = await this.getBlockById(blockId);
        if (!block) {
            throw new Error(`Block ${blockId} doesn't exist`);
        }

        const container = await this.getScheduleContainerForBlock(scheduleContainerId ?? block.scheduleContainerId);
        this.validateBlockTimes(container, durationInSeconds, startTime, endTime);
        block.name = name;
        block.nominationId = nominationId ?? block.nominationId;
        block.durationInSeconds = durationInSeconds ?? 0;
        block.scheduleContainerId = container.scheduleContainerId;
        block.startTime = startTime;
        block.endTime = endTime;

        await this.blockRepository.save(block);
    }

    async moveScheduleItem(scheduleItemId: string, previousScheduleItemId?: string): Promise<void> {
        const scheduleItem = await this.getScheduleItemById(scheduleItemId);
        if (!scheduleItem) {
            throw new Error(`Schedule item ${scheduleItemId} doesn't exist`);
        }

        if (!previousScheduleItemId) {
            await this.moveScheduleItemToTop(scheduleItem);
        } else {
            const previousScheduleItem = await this.getScheduleItemById(previousScheduleItemId);
            if (!previousScheduleItem) {
                throw new Error(`Schedule item with id ${previousScheduleItemId} doesn't exist`);
            }

            await this.moveScheduleItemAfter(scheduleItem, previousScheduleItem);
        }
    }

    private async getBlockById(blockId: string) {
        return this.blockRepository.findOne({ where: { blockId } });
    }

    private async getScheduleContainerForBlock(scheduleContainerId?: string): Promise<ScheduleContainer> {
        if (scheduleContainerId) {
            const container = await this.scheduleContainerRepository.findOne({ where: { scheduleContainerId } });
            if (!container) throw new Error(`Schedule container ${scheduleContainerId} doesn't exist`);
            return container;
        }
        const mainContainer = await this.scheduleContainerRepository.findOne({ where: { code: 'main-stage' } });
        if (!mainContainer) throw new Error('Main stage schedule container does not exist');
        return mainContainer;
    }

    private validateBlockTimes(container: ScheduleContainer, durationInSeconds?: number, startTime?: string, endTime?: string) {
        if (container.timeMode === 'calculated' && typeof durationInSeconds !== 'number') {
            throw new Error('Calculated schedule blocks require durationInSeconds');
        }
        if (container.timeMode === 'explicit' && startTime && endTime && endTime <= startTime) {
            throw new Error('Explicit schedule block endTime should be after startTime');
        }
    }

    private async moveBlockToTop(block: Block) {
        const otherBlocks = await this.blockRepository.find({
            where: { order: MoreThanOrEqual(0), blockId: Not(block.blockId), scheduleContainerId: block.scheduleContainerId },
        });

        await this.updateOrderAndSaveBlocks(0, block, otherBlocks);
    }

    private async moveBlockAfter(block: Block, previousBlock: Block) {
        block.order = previousBlock.order + 1;

        const otherBlocks = await this.blockRepository.find({
            where: { order: MoreThanOrEqual(block.order), blockId: Not(block.blockId), scheduleContainerId: block.scheduleContainerId },
        });

        await this.updateOrderAndSaveBlocks(block.order, block, otherBlocks);
    }

    private async updateOrderAndSaveBlocks(newOrder: number, block: Block, otherBlocks: Block[]) {
        otherBlocks.forEach(otherBlock => {
            otherBlock.order += 1;
        });

        block.order = newOrder;
        await this.blockRepository.save([...otherBlocks, block]);
    }

    private async getScheduleItemById(scheduleItemId: string) {
        return this.scheduleItemsRepository.findOne({ where: { scheduleItemId } });
    }

    private async moveScheduleItemToTop(scheduleItem: ScheduleItem) {
        const otherScheduleItems = await this.scheduleItemsRepository.find({
            where: { order: MoreThanOrEqual(0), scheduleItemId: Not(scheduleItem.scheduleItemId), blockId: scheduleItem.blockId },
        });

        await this.updateOrderAndSaveScheduleItems(0, scheduleItem, otherScheduleItems);
    }

    private async moveScheduleItemAfter(scheduleItem: ScheduleItem, previousScheduleItem: ScheduleItem) {
        scheduleItem.order = previousScheduleItem.order + 1;

        const otherScheduleItems = await this.scheduleItemsRepository.find({
            where: {
                order: MoreThanOrEqual(scheduleItem.order),
                scheduleItemId: Not(scheduleItem.scheduleItemId),
                blockId: scheduleItem.blockId,
            },
        });

        await this.updateOrderAndSaveScheduleItems(scheduleItem.order, scheduleItem, otherScheduleItems);
    }

    private async updateOrderAndSaveScheduleItems(newOrder: number, scheduleItem: ScheduleItem, otherScheduleItems: ScheduleItem[]) {
        otherScheduleItems.forEach(otherItem => {
            otherItem.order += 1;
        });

        scheduleItem.order = newOrder;
        await this.scheduleItemsRepository.save([...otherScheduleItems, scheduleItem]);
    }
}
