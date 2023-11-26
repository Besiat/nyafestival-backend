import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleItem } from '../entity/festival/schedule-item.entity';
import { Application } from '../entity/festival/application.entity';
import { MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Block } from '../entity/festival/block.entity';

@Injectable()
export class ScheduleService {
    constructor(@InjectRepository(ScheduleItem) private readonly scheduleItemsRepository: Repository<ScheduleItem>,
        @InjectRepository(Block) private readonly blockRepository: Repository<Block>,
        @InjectRepository(Application) private readonly applicationRepository: Repository<Application>) {
    }

    async createScheduleItem(applicationId: string, blockId: string): Promise<void> {
        const application = await this.applicationRepository.findOne({ where: { applicationId } });
        if (!application) throw new Error(`Application ${applicationId} doesn't exist`);
        const alreadyExists = this.scheduleItemsRepository.findOne({ where: { applicationId } });
        if (alreadyExists) throw new Error(`Schedule item for application ${applicationId} already exists`);
        const maxOrder = await this.scheduleItemsRepository.maximum("order", { blockId });
        const newScheduleItem = this.scheduleItemsRepository.create();
        newScheduleItem.applicationId = applicationId;
        newScheduleItem.name = application.fullName;
        newScheduleItem.blockId = blockId;
        newScheduleItem.order = typeof (maxOrder) === 'number' ? maxOrder + 1 : 0;
        await this.scheduleItemsRepository.save(newScheduleItem);
    }

    async deleteScheduleItem(scheduleItemId: string): Promise<void> {
        await this.scheduleItemsRepository.delete(scheduleItemId);
    }

    async getSchedule(): Promise<Block[]> {
        const blocks = this.blockRepository.createQueryBuilder('block')
            .leftJoinAndSelect('block.scheduleItems', 'scheduleItems')
            .orderBy('scheduleItems.order')
            .addOrderBy('block.order')
            .getMany();

        return blocks;
    }

    async moveScheduleItemToAnotherBlock(scheduleItemId: string, blockId: string): Promise<void> {
        const scheduleItem = await this.scheduleItemsRepository.findOne({ where: { scheduleItemId } });
        const maxOrder = await this.scheduleItemsRepository.maximum("order", { blockId });
        if (!scheduleItem)
            throw new Error(`Schedule item ${scheduleItem} doesn't exist`);
        scheduleItem.blockId = blockId;
        scheduleItem.order = typeof (maxOrder) === 'number' ? maxOrder + 1 : 0;
        await this.scheduleItemsRepository.save(scheduleItem);
    }

    async createBlock(nominationId: string, name: string, order: number, durationInSeconds: number) {
        const newBlock = this.blockRepository.create();
        newBlock.name = name;
        newBlock.nominationId = nominationId;
        newBlock.order = order;
        newBlock.durationInSeconds = durationInSeconds;
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

    async updateBlock(blockId: string, name: string, durationInSeconds: number): Promise<void> {
        const block = await this.getBlockById(blockId);
        if (!block) {
            throw new Error(`Block ${blockId} doesn't exist`);
        }

        block.name = name;
        block.durationInSeconds = durationInSeconds;

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

    private async moveBlockToTop(block: Block) {
        const otherBlocks = await this.blockRepository.find({
            where: { order: MoreThanOrEqual(0), blockId: Not(block.blockId) }
        });

        await this.updateOrderAndSaveBlocks(0, block, otherBlocks);
    }

    private async moveBlockAfter(block: Block, previousBlock: Block) {
        block.order = previousBlock.order + 1;

        const otherBlocks = await this.blockRepository.find({
            where: { order: MoreThanOrEqual(block.order), blockId: Not(block.blockId) }
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
            where: { order: MoreThanOrEqual(0), scheduleItemId: Not(scheduleItem.scheduleItemId) },
        });

        await this.updateOrderAndSaveScheduleItems(0, scheduleItem, otherScheduleItems);
    }

    private async moveScheduleItemAfter(scheduleItem: ScheduleItem, previousScheduleItem: ScheduleItem) {
        scheduleItem.order = previousScheduleItem.order + 1;

        const otherScheduleItems = await this.scheduleItemsRepository.find({
            where: { order: MoreThanOrEqual(scheduleItem.order), scheduleItemId: Not(scheduleItem.scheduleItemId) },
        });

        await this.updateOrderAndSaveScheduleItems(scheduleItem.order, scheduleItem, otherScheduleItems);
    }

    private async updateOrderAndSaveScheduleItems(newOrder: number, scheduleItem: ScheduleItem, otherScheduleItems: ScheduleItem[]) {
        otherScheduleItems.forEach((otherItem) => {
            otherItem.order += 1;
        });

        scheduleItem.order = newOrder;
        await this.scheduleItemsRepository.save([...otherScheduleItems, scheduleItem]);
    }

}