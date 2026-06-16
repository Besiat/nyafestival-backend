import { Controller, Post, Delete, Put, Body, Param, UseGuards, Get, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { AdminGuard } from '../guards/admin-guard';
import { ScheduleService } from '../services/schedule.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Block } from '../entity/festival/block.entity';
import { CreateScheduleItemDTO } from '../dto/create-schedule-item.dto';
import { CreateBlockDTO } from '../dto/create-block.dto';
import { jwtDecode } from 'jwt-decode';
import { BlockForScheduleItemForUserDTO } from '../dto/block-for-schedule-item-for-user.dto';
import { ScheduleContainerDTO, UpsertScheduleContainerDTO } from '../dto/schedule-container.dto';
import { ScheduleContainer } from '../entity/festival/schedule-container.entity';

@Controller('api/schedule')
@ApiTags('Schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) {}

    @Post('create-schedule-item')
    @ApiOperation({ operationId: 'createScheduleItem', summary: 'Create a new schedule item' })
    @ApiResponse({ status: 201, description: 'Creates a new schedule item' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async createScheduleItem(@Body() data: CreateScheduleItemDTO): Promise<void> {
        await this.scheduleService.createScheduleItem(data.blockId, data.applicationId, data.title, data.subtitle);
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
        await this.scheduleService.createBlock(
            data.name,
            data.order,
            data.durationInSeconds,
            data.nominationId,
            data.scheduleContainerId,
            data.startTime,
            data.endTime,
        );
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
    async moveBlock(@Param('blockId') blockId: string, @Param('previousBlockId') previousBlockId?: string): Promise<void> {
        await this.scheduleService.moveBlock(blockId, previousBlockId);
    }

    @Put('move-block/:blockId')
    @ApiOperation({ operationId: 'moveBlockToTop', summary: 'Move a block to top' })
    @ApiResponse({ status: 200, description: 'Moves a block to top' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async moveBlockToTop(@Param('blockId') blockId: string): Promise<void> {
        await this.scheduleService.moveBlock(blockId);
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
        if (previousScheduleItemId?.trim() === '') previousScheduleItemId = undefined;
        await this.scheduleService.moveScheduleItem(scheduleItemId, previousScheduleItemId);
    }

    @Put('move-schedule-item/:scheduleItemId')
    @ApiOperation({ operationId: 'moveScheduleItemToTop', summary: 'Move a schedule item to top' })
    @ApiResponse({ status: 200, description: 'Moves a schedule item to top' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async moveScheduleItemToTop(@Param('scheduleItemId') scheduleItemId: string): Promise<void> {
        await this.scheduleService.moveScheduleItem(scheduleItemId);
    }

    @Get('containers')
    @ApiOperation({ operationId: 'getScheduleContainers', summary: 'Returns schedule grouped by containers' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Schedule containers', type: ScheduleContainerDTO })
    async getScheduleContainers(@Request() req): Promise<ScheduleContainerDTO[]> {
        const token = req.headers.authorization;
        let userId: string = null;
        if (token) {
            const decoded = jwtDecode(token.split(' ')[1]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            userId = (decoded as any).userId;
        }
        const codes =
            typeof req.query.codes === 'string'
                ? req.query.codes
                      .split(',')
                      .map((code: string) => code.trim())
                      .filter(Boolean)
                : undefined;
        return this.scheduleService.getScheduleContainers(userId, codes);
    }

    @Get('container-list')
    @ApiOperation({ operationId: 'getScheduleContainerList', summary: 'Returns schedule containers without blocks' })
    @ApiResponse({ status: 200, description: 'Schedule containers', type: ScheduleContainer })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async getScheduleContainerList(): Promise<ScheduleContainer[]> {
        return this.scheduleService.getScheduleContainerList();
    }

    @Post('create-container')
    @ApiOperation({ operationId: 'createScheduleContainer', summary: 'Create a schedule container' })
    @ApiResponse({ status: 201, description: 'Creates a schedule container' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async createScheduleContainer(@Body() data: UpsertScheduleContainerDTO): Promise<void> {
        await this.scheduleService.createScheduleContainer(data);
    }

    @Put('update-container/:scheduleContainerId')
    @ApiOperation({ operationId: 'updateScheduleContainer', summary: 'Update a schedule container' })
    @ApiResponse({ status: 200, description: 'Updates a schedule container' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async updateScheduleContainer(
        @Param('scheduleContainerId') scheduleContainerId: string,
        @Body() data: UpsertScheduleContainerDTO,
    ): Promise<void> {
        await this.scheduleService.updateScheduleContainer(scheduleContainerId, data);
    }

    @Delete('delete-container/:scheduleContainerId')
    @ApiOperation({ operationId: 'deleteScheduleContainer', summary: 'Delete a schedule container' })
    @ApiResponse({ status: 200, description: 'Deletes a schedule container' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async deleteScheduleContainer(@Param('scheduleContainerId') scheduleContainerId: string): Promise<void> {
        await this.scheduleService.deleteScheduleContainer(scheduleContainerId);
    }

    @Get()
    @ApiOperation({ operationId: 'getSchedule', summary: 'Returns full ordered schedule' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Schedule', type: BlockForScheduleItemForUserDTO })
    async getSchedule(@Request() req): Promise<BlockForScheduleItemForUserDTO[]> {
        const token = req.headers.authorization;
        let userId: string = null;
        if (token) {
            const decoded = jwtDecode(token.split(' ')[1]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            userId = (decoded as any).userId;
        }
        return this.scheduleService.getSchedule(userId);
    }

    @Put('update-block/:blockId')
    @ApiOperation({ operationId: 'updateBlock', summary: 'Update a block' })
    @ApiResponse({ status: 200, description: 'Updates a block' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'blockId', description: 'Block ID' })
    async updateBlock(@Param('blockId') blockId: string, @Body() data: CreateBlockDTO): Promise<void> {
        await this.scheduleService.updateBlock(
            blockId,
            data.name,
            data.durationInSeconds,
            data.nominationId,
            data.scheduleContainerId,
            data.startTime,
            data.endTime,
        );
    }
}
