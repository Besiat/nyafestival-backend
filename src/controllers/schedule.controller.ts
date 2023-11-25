import { Controller, Post, Delete, Put, Body, Param, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { AdminGuard } from '../guards/admin-guard';
import { ScheduleService } from '../services/schedule.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Block } from '../entity/festival/block.entity';
import { CreateScheduleItemDTO } from '../dto/create-schedule-item.dto';
import { CreateBlockDTO } from '../dto/create-block.dto';

@Controller('api/schedule')
@ApiTags('Schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) { }

    @Post('create-schedule-item')
    @ApiOperation({ operationId: 'createScheduleItem', summary: 'Create a new schedule item' })
    @ApiResponse({ status: 201, description: 'Creates a new schedule item' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async createScheduleItem(@Body() data: CreateScheduleItemDTO): Promise<void> {
        await this.scheduleService.createScheduleItem(data.applicationId, data.blockId);
    }

    @Delete('delete-schedule-item/:scheduleItemId')
    @ApiOperation({ operationId: 'deleteScheduleItem', summary: 'Delete a schedule item' })
    @ApiResponse({ status: 200, description: 'Deletes a schedule item' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'scheduleItemId', description: 'Schedule Item ID' })
    async deleteScheduleItem(@Param('scheduleItemId') scheduleItemId: string): Promise<void> {
        await this.scheduleService.deleteScheduleItem(scheduleItemId);
    }

    @Put('move-schedule-item-to-block/:scheduleItemId/:blockId')
    @ApiOperation({ operationId: 'moveScheduleItemToAnotherBlock', summary: 'Move a schedule item to another block' })
    @ApiResponse({ status: 200, description: 'Moves a schedule item to another block' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'scheduleItemId', description: 'Schedule Item ID' })
    @ApiParam({ name: 'blockId', description: 'Block ID' })
    async moveScheduleItemToAnotherBlock(
        @Param('scheduleItemId') scheduleItemId: string,
        @Param('blockId') blockId: string,
    ): Promise<void> {
        await this.scheduleService.moveScheduleItemToAnotherBlock(scheduleItemId, blockId);
    }

    @Post('create-block')
    @ApiOperation({ operationId: 'createBlock', summary: 'Create a new block' })
    @ApiResponse({ status: 201, description: 'Creates a new block' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async createBlock(@Body() data: CreateBlockDTO): Promise<void> {
        await this.scheduleService.createBlock(data.nominationId, data.name, data.order, data.durationInSeconds);
    }

    @Delete('delete-block/:blockId')
    @ApiOperation({ operationId: 'deleteBlock', summary: 'Delete a block' })
    @ApiResponse({ status: 200, description: 'Deletes a block' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'blockId', description: 'Block ID' })
    async deleteBlock(@Param('blockId') blockId: string): Promise<void> {
        await this.scheduleService.deleteBlock(blockId);
    }

    @Put('move-block/:blockId/:previousBlockId')
    @ApiOperation({ operationId: 'moveBlock', summary: 'Move a block' })
    @ApiResponse({ status: 200, description: 'Moves a block' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'blockId', description: 'Block ID' })
    @ApiParam({ name: 'previousBlockId', description: 'Previous Block ID', required: false })
    async moveBlock(
        @Param('blockId') blockId: string,
        @Param('previousBlockId') previousBlockId?: string,
    ): Promise<void> {
        await this.scheduleService.moveBlock(blockId, previousBlockId);
    }

    @Put('move-schedule-item/:scheduleItemId/:previousScheduleItemId')
    @ApiOperation({ operationId: 'moveScheduleItem', summary: 'Move a schedule item' })
    @ApiResponse({ status: 200, description: 'Moves a schedule item' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'scheduleItemId', description: 'Schedule Item ID' })
    @ApiParam({ name: 'previousScheduleItemId', description: 'Previous Schedule Item ID', required: false })
    async moveScheduleItem(
        @Param('scheduleItemId') scheduleItemId: string,
        @Param('previousScheduleItemId') previousScheduleItemId?: string,
    ): Promise<void> {
        if (previousScheduleItemId.trim()==='') previousScheduleItemId = undefined;
        await this.scheduleService.moveScheduleItem(scheduleItemId, previousScheduleItemId);
    }

    @Get()
    @ApiOperation({ operationId: 'getSchedule', summary: 'Returns full ordered schedule' })
    @ApiResponse({ status: 200, description: 'Schedule', type: Block })
    async getSchedule(): Promise<Block[]> {
        return this.scheduleService.getSchedule();
    }
}
