// nomination.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { NominationService } from '../services/nomination.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Nomination } from '../entity/festival/nomination.entity';
import { AdminGuard } from '../guards/admin-guard';
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { NominationPublicDTO } from '../dto/nomination-public.dto';
import { randomUUID } from 'crypto';

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

    @Get('applications')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiOperation({ operationId: 'findAll', summary: 'Get all nominations with applications' })
    @ApiResponse({ status: 200, description: 'Returns all nominations with applications', type: Nomination, isArray: true })
    @ApiBearerAuth()
    async findAllWithNominations(): Promise<Nomination[]> {
        return (await this.nominationService.getAllNominationsWithApplications());
    }

    @Get('applicationsPublic')
    @ApiOperation({ operationId: 'findAllPublic', summary: 'Get all applications public' })
    @ApiResponse({ status: 200, description: 'Returns all nominations with applications', type: Nomination, isArray: true })
    async findAllApplicationsPublic(): Promise<NominationPublicDTO[]> {
        const nominations = (await this.nominationService.getAllNominationsWithApplications());
        const result = nominations.map(nomination => ({
            id: randomUUID(),
            name: nomination.name,
            subNominations: nomination.subNominations.map(subNomination => ({
                id: randomUUID(),
                name: subNomination.name,
                applications: subNomination.applications.map(application => ({
                    id: randomUUID(),
                    fullName: application.fullName,
                    status: application.state,
                })),
            })),
        }));

        return result;
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
    @ApiBearerAuth()
    async create(@Body() nominationData: Partial<Nomination>): Promise<Nomination> {
        return this.nominationService.createNomination(nominationData);
    }

    @Put(':id')
    @ApiOperation({ operationId: 'update', summary: 'Update a nomination by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Nomination ID' })
    @ApiBody({ type: Nomination, description: 'Updated nomination data' })
    @ApiResponse({ status: 200, description: 'Updates a nomination by ID', type: Nomination })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async update(@Param('id') id: string, @Body() nomination: Nomination): Promise<Nomination | undefined> {
        return this.nominationService.updateNomination(nomination);
    }

    @Delete(':id')
    @ApiOperation({ operationId: 'remove', summary: 'Delete a nomination by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Nomination ID' })
    @ApiResponse({ status: 204, description: 'Deletes a nomination by ID' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
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
    @ApiBearerAuth()
    async addFieldToNomination(
        @Param('nominationId') nominationId: string,
        @Param('fieldId') fieldId: string,
        @Param('order') order: number = 0
    ): Promise<Nomination | undefined> {
        try {
            await this.nominationService.addFieldToNomination(nominationId, fieldId, order);
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
    @ApiBearerAuth()
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
