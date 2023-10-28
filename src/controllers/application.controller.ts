import { Controller, Post, Body, UseGuards, Request, Param, Get, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterApplicationDTO } from '../dto/register-application.dto';
import { ApplicationService } from '../services/application.service';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { Throttle } from '@nestjs/throttler';
import { Application } from '../entity/festival/application.entity';
import { UpdateApplicationDTO } from '../dto/update-application.dto';

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
    @ApiOperation({ operationId: 'update', summary: 'Register a new application' })
    @ApiBody({ type: UpdateApplicationDTO, description: 'Application data to register' })
    @ApiResponse({ status: 201, description: 'Registers a new application' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async updateApplication(@Body() application: UpdateApplicationDTO, @Request() req): Promise<void> {
        const userId = req.user.userId;
        this.applicationService.updateApplication(userId, application);
    }


    @Post(':applicationId/set-pending-state')
    @ApiOperation({ operationId: 'setPendingState', summary: 'Set the application to Pending state' })
    @ApiResponse({ status: 200, description: 'Application set to Pending state' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    async setPendingState(@Param('applicationId') applicationId: string): Promise<void> {
        await this.applicationService.setPendingState(applicationId);
    }

    @Post(':applicationId/set-invalid-state')
    @ApiOperation({ operationId: 'setInvalidState', summary: 'Set the application to Invalid state' })
    @ApiResponse({ status: 200, description: 'Application set to Invalid state' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    async setInvalidState(@Param('applicationId') applicationId: string, @Body() note: string): Promise<void> {
        await this.applicationService.setInvalidState(applicationId, note);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('userApplications')
    @ApiResponse({ status: 200 })
    async getApplications(@Request() req): Promise<Application[]> {
        const applications = this.applicationService.getByUserId(req.user.userId);
        return applications;
    }
}
