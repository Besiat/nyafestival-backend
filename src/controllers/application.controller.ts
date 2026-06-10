import { Controller, Post, Body, UseGuards, Request, Param, Get, Put, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterApplicationDTO } from '../dto/register-application.dto';
import { ApplicationService } from '../services/application.service';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { Throttle } from '@nestjs/throttler';
import { Application } from '../entity/festival/application.entity';
import { UpdateApplicationDTO } from '../dto/update-application.dto';
import { ApplicationData } from '../entity/festival/application-data.entity';
import { AdminGuard } from '../guards/admin-guard';
import { SetApplicationStateDTO } from '../dto/set-application-state.dto';
import { AuthenticatedRequest } from '../interfaces/authenticated-request';

@Controller('api/applications')
@ApiTags('Applications')
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) {}

    @Post()
    @Throttle({ default: { limit: 1, ttl: 5000 } })
    @ApiOperation({ operationId: 'register', summary: 'Register a new application' })
    @ApiBody({ type: RegisterApplicationDTO, description: 'Application data to register' })
    @ApiResponse({ status: 201, description: 'Registers a new application' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async registerApplication(@Body() application: RegisterApplicationDTO, @Request() req: AuthenticatedRequest): Promise<void> {
        const userId = req.user.userId;
        await this.applicationService.registerApplication(userId, application);
    }

    @Put()
    @Throttle({ default: { limit: 1, ttl: 5000 } })
    @ApiOperation({ operationId: 'update', summary: 'Update an application' })
    @ApiBody({ type: UpdateApplicationDTO, description: 'Application data to update' })
    @ApiResponse({ status: 200, description: 'Application updated successfully' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async updateApplication(@Body() application: UpdateApplicationDTO, @Request() req: AuthenticatedRequest): Promise<void> {
        const userId = req.user.userId;
        await this.applicationService.updateApplication(userId, application);
    }

    @Post(':applicationId/state')
    @ApiOperation({ operationId: 'setApplicationState', summary: 'Set the application state' })
    @ApiResponse({ status: 200, description: 'Application state updated successfully' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @ApiBody({ type: SetApplicationStateDTO })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async setApplicationState(
        @Param('applicationId') applicationId: string,
        @Body(ValidationPipe) body: SetApplicationStateDTO,
    ): Promise<void> {
        await this.applicationService.setApplicationState(applicationId, body.state, body.note);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('userApplications')
    @ApiResponse({ status: 200 })
    async getApplications(@Request() req: AuthenticatedRequest): Promise<Application[]> {
        return await this.applicationService.getByUserId(req.user.userId);
    }

    @Get()
    @ApiOperation({ operationId: 'getAllApplications', summary: 'Returns all applications' })
    @ApiResponse({ status: 200, description: 'Applications', type: Application, isArray: true })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async getAllApplications(): Promise<Application[]> {
        return await this.applicationService.getApplications();
    }

    @Get(':applicationId/applicationData')
    @ApiOperation({ operationId: 'getApplicationData', summary: 'Returns all data of the application' })
    @ApiResponse({ status: 200, description: 'Data of the application', type: ApplicationData, isArray: true })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async getApplciationData(@Param('applicationId') applicationId: string): Promise<ApplicationData[]> {
        return await this.applicationService.getApplicationData(applicationId);
    }

    @Get('char-pic-application-data')
    @ApiOperation({ operationId: 'getCharPicApplicationData', summary: 'Retrieve application data for char_pic field' })
    @ApiResponse({ status: 200, description: 'List of application data with char_pic values' })
    async getCharPicApplicationData(): Promise<{ applicationId: string; value: string }[]> {
        return this.applicationService.getApplicationDataWithFieldValues(['char_pic']);
    }

    @Get('fio-application-data')
    @ApiOperation({ operationId: 'getFioApplicationData', summary: 'Retrieve application data for fio and fio_group field' })
    @ApiResponse({ status: 200, description: 'List of application data with fio values' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getFioApplicationData(): Promise<{ applicationId: string; value: string }[]> {
        return this.applicationService.getApplicationDataWithFieldValues(['FIO', 'fio_group']);
    }
}
