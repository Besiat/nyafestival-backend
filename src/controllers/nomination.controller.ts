// nomination.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { NominationService } from '../services/nomination.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Nomination } from '../entity/festival/nomination.entity';
import { AdminGuard } from '../guards/admin-guard';
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { JwtAuthGuard } from '../guards/jwt-guard';

@Controller('api/nominations')
@ApiTags('Nominations') // Optional: Group your API under a tag
export class NominationController {
    constructor(private readonly nominationService: NominationService) { }

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

    @Get(':id/subNominations')
    @ApiOperation({ operationId: 'getSubnominations', summary: 'Get subnominations' })
    @ApiParam({ name: 'id', type: String, description: 'Nomination ID' })
    @ApiResponse({ status: 200, description: 'Returns a nomination by ID', type: SubNomination, isArray: true })
    async getSubNominations(@Param('id') id: string) {
        return this.nominationService.getSubNominations(id);
    }

    @Post()
    @ApiOperation({ operationId: 'create', summary: 'Create a new nomination' })
    @ApiBody({ type: Nomination, description: 'Nomination data to create' })
    @ApiResponse({ status: 201, description: 'Creates a new nomination', type: Nomination })
    @UseGuards(JwtAuthGuard, AdminGuard)
    async create(@Body() nominationData: Partial<Nomination>): Promise<Nomination> {
        return this.nominationService.createNomination(nominationData);
    }

    @Put(':id')
    @ApiOperation({ operationId: 'update', summary: 'Update a nomination by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Nomination ID' })
    @ApiBody({ type: Nomination, description: 'Updated nomination data' })
    @ApiResponse({ status: 200, description: 'Updates a nomination by ID', type: Nomination })
    @UseGuards(JwtAuthGuard, AdminGuard)
    async update(@Param('id') id: string, @Body() nomination: Nomination): Promise<Nomination | undefined> {
        return this.nominationService.updateNomination(nomination);
    }

    @Delete(':id')
    @ApiOperation({ operationId: 'remove', summary: 'Delete a nomination by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Nomination ID' })
    @ApiResponse({ status: 204, description: 'Deletes a nomination by ID' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    async remove(@Param('id') id: string): Promise<void> {
        await this.nominationService.deleteNomination(id);
    }

    @Post(':nominationId/add-field/:fieldId')
    @ApiOperation({ operationId: 'addFieldToNomination', summary: 'Add a field to a nomination' })
    @ApiParam({ name: 'nominationId', type: String, description: 'Nomination ID' })
    @ApiParam({ name: 'fieldId', type: String, description: 'Field ID' })
    @ApiResponse({ status: 200, description: 'Adds a field to the nomination', type: Nomination })
    @ApiResponse({ status: 404, description: 'Nomination or field not found' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    async addFieldToNomination(
        @Param('nominationId') nominationId: string,
        @Param('fieldId') fieldId: string,
    ): Promise<Nomination | undefined> {
        try {
            await this.nominationService.addFieldToNomination(nominationId, fieldId);
            return this.nominationService.getNominationById(nominationId);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Delete(':nominationId/remove-field/:fieldId')
    @ApiOperation({ operationId: 'removeFieldFromNomination', summary: 'Remove a field from a nomination' })
    @ApiParam({ name: 'nominationId', type: String, description: 'Nomination ID' })
    @ApiParam({ name: 'fieldId', type: String, description: 'Field ID' })
    @ApiResponse({ status: 200, description: 'Removes a field from the nomination', type: Nomination })
    @ApiResponse({ status: 404, description: 'Nomination or field not found' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    async removeFieldFromNomination(
        @Param('nominationId') nominationId: string,
        @Param('fieldId') fieldId: string,
    ): Promise<Nomination | undefined> {
        try {
            await this.nominationService.removeFieldFromNomination(nominationId, fieldId);
            return this.nominationService.getNominationById(nominationId);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
