// nomination.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { NominationService } from '../services/nomination.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Nomination } from '../entity/festival/nomination.entity';
import { AdminGuard } from '../guards/admin-guard';

@Controller('nominations')
@ApiTags('Nominations') // Optional: Group your API under a tag
export class NominationController {
    constructor(private readonly nominationService: NominationService) {}

    @Get()
    @ApiOperation({ operationId: 'findAll', summary: 'Get all nominations' })
    @ApiResponse({ status: 200, description: 'Returns all nominations', type: Nomination, isArray: true })
    async findAll(): Promise<Nomination[]> {
        return this.nominationService.getAllNominations();
    }

    @Get(':id')
    @ApiOperation({ operationId: 'findOne', summary: 'Get a nomination by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Nomination ID' })
    @ApiResponse({ status: 200, description: 'Returns a nomination by ID', type: Nomination })
    async findOne(@Param('id') id: string): Promise<Nomination | undefined> {
        return this.nominationService.getNominationById(id);
    }

    @Post()
    @ApiOperation({ operationId: 'create', summary: 'Create a new nomination' })
    @ApiBody({ type: Nomination, description: 'Nomination data to create' })
    @ApiResponse({ status: 201, description: 'Creates a new nomination', type: Nomination })
    @UseGuards(AdminGuard)
    async create(@Body() nominationData: Partial<Nomination>): Promise<Nomination> {
        return this.nominationService.createNomination(nominationData);
    }

    @Put(':id')
    @ApiOperation({ operationId: 'update', summary: 'Update a nomination by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Nomination ID' })
    @ApiBody({ type: Nomination, description: 'Updated nomination data' })
    @ApiResponse({ status: 200, description: 'Updates a nomination by ID', type: Nomination })
    @UseGuards(AdminGuard)
    async update(@Param('id') id: string, @Body() nominationData: Partial<Nomination>): Promise<Nomination | undefined> {
        return this.nominationService.updateNomination(id, nominationData);
    }

    @Delete(':id')
    @ApiOperation({ operationId: 'remove', summary: 'Delete a nomination by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Nomination ID' })
    @ApiResponse({ status: 204, description: 'Deletes a nomination by ID' })
    @UseGuards(AdminGuard)
    async remove(@Param('id') id: string): Promise<void> {
        await this.nominationService.deleteNomination(id);
    }
}
