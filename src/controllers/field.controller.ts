import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { FieldService } from '../services/field.service';
import { Field } from '../entity/festival/field.entity';
import { AdminGuard } from '../guards/admin-guard';
import { JwtAuthGuard } from '../guards/jwt-guard';

@Controller('api/fields')
@ApiTags('Fields')
@UseGuards(JwtAuthGuard, AdminGuard)
export class FieldsController {
  constructor(private readonly fieldService: FieldService) { }

  @Get()
  @ApiOperation({ operationId: 'findAll', summary: 'Get all fields' })
  @ApiResponse({ status: 200, description: 'Returns all fields', type: Field, isArray: true })
  async findAll(): Promise<Field[]> {
    return this.fieldService.getAllFields();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'findOne', summary: 'Get a field by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field ID' })
  @ApiResponse({ status: 200, description: 'Returns a field by ID', type: Field })
  async findOne(@Param('id') id: string): Promise<Field | undefined> {
    return this.fieldService.getFieldById(id);
  }

  @Post()
  @ApiOperation({ operationId: 'create', summary: 'Create a new field' })
  @ApiBody({ type: Field, description: 'Field data to create' })
  @ApiResponse({ status: 201, description: 'Creates a new field', type: Field })
  async create(@Body() fieldData: Partial<Field>): Promise<Field> {
    return this.fieldService.createField(fieldData);
  }

  @Put(':id')
  @ApiOperation({ operationId: 'update', summary: 'Update a field by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field ID' })
  @ApiBody({ type: Field, description: 'Updated field data' })
  @ApiResponse({ status: 200, description: 'Updates a field by ID', type: Field })
  async update(@Param('id') id: string, @Body() fieldData: Partial<Field>): Promise<Field | undefined> {
    return this.fieldService.updateField(id, fieldData);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'remove', summary: 'Delete a field by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field ID' })
  @ApiResponse({ status: 204, description: 'Deletes a field by ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.fieldService.deleteField(id);
  }
}
