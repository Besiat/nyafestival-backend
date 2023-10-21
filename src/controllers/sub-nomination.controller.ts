import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin-guard';
import { SubNominationService } from '../services/sub-nomination.service';
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { JwtAuthGuard } from '../guards/jwt-guard';

@Controller('api/sub-nominations')
@ApiTags('SubNominations')
export class SubNominationController {
  constructor(private readonly subNominationService: SubNominationService) {}

  @Get()
  @ApiOperation({ operationId: 'findAll', summary: 'Get all sub-nominations' })
  @ApiResponse({ status: 200, description: 'Returns all sub-nominations', type: SubNomination, isArray: true })
  async findAll(): Promise<SubNomination[]> {
    return this.subNominationService.getAllSubNominations();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'findOne', summary: 'Get a sub-nomination by ID' })
  @ApiParam({ name: 'id', type: String, description: 'SubNomination ID' })
  @ApiResponse({ status: 200, description: 'Returns a sub-nomination by ID', type: SubNomination })
  async findOne(@Param('id') id: string): Promise<SubNomination | undefined> {
    return this.subNominationService.getSubNominationById(id);
  }

  @Post()
  @ApiOperation({ operationId: 'create', summary: 'Create a new sub-nomination' })
  @ApiBody({ type: SubNomination, description: 'SubNomination data to create' })
  @ApiResponse({ status: 201, description: 'Creates a new sub-nomination', type: SubNomination })
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() subNominationData: Partial<SubNomination>): Promise<SubNomination> {
    return this.subNominationService.createSubNomination(subNominationData);
  }

  @Put(':id')
  @ApiOperation({ operationId: 'update', summary: 'Update a sub-nomination by ID' })
  @ApiParam({ name: 'id', type: String, description: 'SubNomination ID' })
  @ApiBody({ type: SubNomination, description: 'Updated sub-nomination data' })
  @ApiResponse({ status: 200, description: 'Updates a sub-nomination by ID', type: SubNomination })
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() subNominationData: Partial<SubNomination>): Promise<SubNomination | undefined> {
    return this.subNominationService.updateSubNomination(id, subNominationData);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'remove', summary: 'Delete a sub-nomination by ID' })
  @ApiParam({ name: 'id', type: String, description: 'SubNomination ID' })
  @ApiResponse({ status: 204, description: 'Deletes a sub-nomination by ID' })
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string): Promise<void> {
    await this.subNominationService.deleteSubNomination(id);
  }
}
