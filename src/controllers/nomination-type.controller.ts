import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { NominationType } from '../entity/festival/nomination-type.entity'
import { NominationTypeService } from '../services/nomination-type.service'

@ApiTags('nomination-types')
@Controller('api/nomination-types')
export class NominationTypeController {
  constructor(private readonly nominationTypeService: NominationTypeService) {}

  @Get()
  @ApiOperation({
    operationId: 'findAllNominationTypes',
    summary: 'Get all nomination types',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all nomination types',
    type: NominationType,
    isArray: true,
  })
  async findAll(): Promise<NominationType[]> {
    return this.nominationTypeService.getAllNominationTypes()
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'findOneNominationType',
    summary: 'Get a nomination type by ID',
  })
  @ApiParam({ name: 'id', type: String, description: 'Nomination type ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a nomination type by ID',
    type: NominationType,
  })
  async findOne(@Param('id') id: string): Promise<NominationType | null> {
    return this.nominationTypeService.getNominationTypeById(id)
  }

  @Post()
  @ApiOperation({
    operationId: 'createNominationType',
    summary: 'Create a nomination type',
  })
  @ApiBody({ type: NominationType, description: 'Nomination type data' })
  @ApiResponse({
    status: 201,
    description: 'Creates a nomination type',
    type: NominationType,
  })
  async create(
    @Body() nominationTypeData: Partial<NominationType>,
  ): Promise<NominationType> {
    return this.nominationTypeService.createNominationType(nominationTypeData)
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'updateNominationType',
    summary: 'Update a nomination type by ID',
  })
  @ApiParam({ name: 'id', type: String, description: 'Nomination type ID' })
  @ApiBody({
    type: NominationType,
    description: 'Updated nomination type data',
  })
  @ApiResponse({
    status: 200,
    description: 'Updates a nomination type by ID',
    type: NominationType,
  })
  async update(
    @Param('id') id: string,
    @Body() nominationType: NominationType,
  ): Promise<NominationType | null> {
    nominationType.nominationTypeId = id
    return this.nominationTypeService.updateNominationType(nominationType)
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'removeNominationType',
    summary: 'Delete a nomination type by ID',
  })
  @ApiParam({ name: 'id', type: String, description: 'Nomination type ID' })
  @ApiResponse({ status: 204, description: 'Deletes a nomination type by ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.nominationTypeService.deleteNominationType(id)
  }
}
