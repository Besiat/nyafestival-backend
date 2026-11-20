import { Body, Controller, HttpCode, Param, ParseUUIDPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { AuthenticatedRequest } from '../interfaces/authenticated-request';
import { QuestRunService } from '../services/quest-run.service';

class RegisterQuestRunRequest {
    @ApiProperty({ format: 'uuid' })
    runId: string;
}

class RegisterQuestRunResponse {
    @ApiProperty({ format: 'uuid' })
    runId: string;

    @ApiProperty({ format: 'uuid' })
    userId: string;

    @ApiProperty({ type: String, format: 'date-time' })
    startConfirmedAt: Date;
}

class QuestProgressResponse {
    @ApiProperty({ format: 'uuid' })
    runId: string;

    @ApiProperty({ type: Number })
    revision: number;
}

@Controller('api/quests/nyaf2026/runs')
@ApiTags('Quests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class QuestRunController {
    constructor(private readonly questRunService: QuestRunService) {}

    @Post()
    @HttpCode(200)
    @ApiOperation({ operationId: 'registerQuestRun2026', summary: 'Register or retrieve a quest 2026 run' })
    @ApiBody({ type: RegisterQuestRunRequest })
    @ApiResponse({ status: 200, type: RegisterQuestRunResponse })
    @ApiResponse({ status: 400, description: 'Invalid run ID' })
    @ApiResponse({ status: 401, description: 'Authentication required' })
    register(
        @Body('runId', new ParseUUIDPipe({ version: '4' })) runId: string,
        @Req() req: AuthenticatedRequest,
    ): Promise<RegisterQuestRunResponse> {
        return this.questRunService.register(req.user.userId, runId);
    }

    @Put(':runId')
    @ApiOperation({ operationId: 'saveQuestRun2026Progress', summary: 'Save the latest locally persisted quest progress' })
    @ApiBody({ schema: { type: 'object', required: ['revision', 'snapshot'], properties: {
        revision: { type: 'integer', minimum: 1 }, snapshot: { type: 'object' },
    } } })
    @ApiResponse({ status: 200, type: QuestProgressResponse })
    @ApiResponse({ status: 400, description: 'Invalid snapshot or run ID' })
    @ApiResponse({ status: 401, description: 'Authentication required' })
    @ApiResponse({ status: 404, description: 'Run not found for this owner' })
    saveProgress(
        @Param('runId', new ParseUUIDPipe({ version: '4' })) runId: string,
        @Body() body: unknown,
        @Req() req: AuthenticatedRequest,
    ): Promise<QuestProgressResponse> {
        return this.questRunService.saveProgress(req.user.userId, runId, body);
    }
}
