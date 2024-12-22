import { Controller, Post, Body, Param, UseGuards, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { QuestService } from '../services/quest.service';

@Controller('api/quests')
@ApiTags('Quests')
export class QuestController {
    constructor(private readonly questService: QuestService) { }

    @Post(':questCode/progress')
    @ApiOperation({
        operationId: 'getNextStep',
        summary: 'Get the next step of a quest based on the current progress',
    })
    @ApiParam({ name: 'questCode', description: 'Code of the quest' })
    @ApiBody({ description: 'The current step of the quest', type: String })
    @ApiResponse({ status: 200, description: 'Returns the next valid step of the quest' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getNextStep(
        @Param('questCode') questCode: string,
        @Body('providedStep') providedStep: string,
        @Req() req,
        @Res() res
    ): Promise<string> {
        const userId = req.user.userId;
        try {
            const nextStep = await this.questService.getNextStep(userId, questCode, providedStep);
            res.status(200).send(nextStep);
            return;
        } catch (e) {
            res.status(400).send(e.message);
        }
    }
}
