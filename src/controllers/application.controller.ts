import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterApplicationDTO } from '../dto/register-application.dto';
import { ApplicationService } from '../services/application.service';
import { JwtAuthGuard } from '../guards/jwt-guard';

@Controller('api/applications')
@ApiTags('Applications')
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) { }

    @Post()
    @ApiOperation({ operationId: 'register', summary: 'Register a new application' })
    @ApiBody({ type: RegisterApplicationDTO, description: 'Application data to register' })
    @ApiResponse({ status: 201, description: 'Registers a new application' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async registerApplication(@Body() application: RegisterApplicationDTO, @Request() req): Promise<void> {
        const userId = req.user.userId;
        this.applicationService.registerApplication(userId, application);
    }
}
