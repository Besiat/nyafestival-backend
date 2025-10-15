import { Controller, Post, Body, UseGuards, Request, Param, Get, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterApplicationDTO } from '../dto/register-application.dto';
import { ApplicationService } from '../services/application.service';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { Throttle } from '@nestjs/throttler';
import { Application } from '../entity/festival/application.entity';
import { UpdateApplicationDTO } from '../dto/update-application.dto';
import { ApplicationData } from '../entity/festival/application-data.entity';
import { AdminGuard } from '../guards/admin-guard';
import { UserService } from '../services/user.service';

@Controller('api/applications')
@ApiTags('Applications')
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) { }

    @Post()
    @Throttle({ default: { limit: 1, ttl: 5000 } })
    @ApiOperation({ operationId: 'register', summary: 'Register a new application' })
    @ApiBody({ type: RegisterApplicationDTO, description: 'Application data to register' })
    @ApiResponse({ status: 201, description: 'Registers a new application' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async registerApplication(@Body() application: RegisterApplicationDTO, @Request() req): Promise<void> {
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
    async updateApplication(@Body() application: UpdateApplicationDTO, @Request() req): Promise<void> {
        const userId = req.user.userId;
        await this.applicationService.updateApplication(userId, application);
    }

    @Post(':applicationId/set-pending-state')
    @ApiOperation({ operationId: 'setPendingState', summary: 'Set the application to Pending state' })
    @ApiResponse({ status: 200, description: 'Application set to Pending state' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async setPendingState(@Param('applicationId') applicationId: string): Promise<void> {
        await this.applicationService.setPendingState(applicationId);
    }

    @Post(':applicationId/accept')
    @ApiOperation({ operationId: 'setPendingState', summary: 'Set the application to Pending state' })
    @ApiResponse({ status: 200, description: 'Application set to Pending state' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async setAcceptedState(@Param('applicationId') applicationId: string): Promise<void> {
        await this.applicationService.setAcceptedState(applicationId);
    }

    @Post(':applicationId/deny')
    @ApiOperation({ operationId: 'setPendingState', summary: 'Set the application to Pending state' })
    @ApiResponse({ status: 200, description: 'Application set to Pending state' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async setDeniedState(@Param('applicationId') applicationId: string): Promise<void> {
        await this.applicationService.setDeniedState(applicationId);
    }

    @Post(':applicationId/set-invalid-state')
    @ApiOperation({ operationId: 'setInvalidState', summary: 'Set the application to Invalid state' })
    @ApiResponse({ status: 200, description: 'Application set to Invalid state' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async setInvalidState(@Param('applicationId') applicationId: string, @Body() body: { note: string }): Promise<void> {
        await this.applicationService.setInvalidState(applicationId, body.note);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('userApplications')
    @ApiResponse({ status: 200 })
    async getApplications(@Request() req): Promise<Application[]> {
        const applications = await this.applicationService.getByUserId(req.user.userId);
        return applications;
    }

    @Get()
    @ApiOperation({ operationId: 'getAllApplications', summary: 'Returns all applications' })
    @ApiResponse({ status: 200, description: 'Applications', type: Application, isArray: true })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async getAllApplications(): Promise<Application[]> {
        const applications = await this.applicationService.getApplications();
        return applications;
    }

    @Get(':applicationId/applicationData')
    @ApiOperation({ operationId: 'getApplicationData', summary: 'Returns all data of the application' })
    @ApiResponse({ status: 200, description: 'Data of the application', type: ApplicationData, isArray: true })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async getApplciationData(@Param('applicationId') applicationId: string): Promise<ApplicationData[]> {
        const applicationData = await this.applicationService.getApplicationData(applicationId);
        return applicationData;
    }

    @Get('char-pic-application-data')
    @ApiOperation({ operationId: 'getCharPicApplicationData', summary: 'Retrieve application data for char_pic field' })
    @ApiResponse({ status: 200, description: 'List of application data with char_pic values' })
    async getCharPicApplicationData(): Promise<{ applicationId: string; value: string }[]> {
        return this.applicationService.getApplicationDataWithFieldValues(['char_pic']);
    }

    @Get('fio-application-data')
    @ApiOperation({ operationId: 'getFioApplicationData', summary: 'Retrieve application data for fio and fio_group field'})
    @ApiResponse({status: 200, description: 'List of application data with fio values' })
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getFioApplicationData(): Promise<{ applicationId: string; value: string }[]> {
        return this.applicationService.getApplicationDataWithFieldValues(['FIO', 'fio_group']);
    }
}
