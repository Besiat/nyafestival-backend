import { Controller, Post, Get, UseGuards, Request, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { AdminGuard } from '../guards/admin-guard';
import { VotingService } from '../services/voting.service';
import { VoteDTO } from '../dto/vote.dto';
import { PhotocosplayDTO } from '../dto/photocosplay.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { VotingSummaryDTO } from '../dto/voting-summary.dto';

@Controller('api/voting')
@ApiTags('Voting')
export class VotingController {
    constructor(private readonly votingService: VotingService) { }

    @Post('vote')
    @ApiOperation({ summary: 'Vote for an application' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiBody({ type: VoteDTO })
    async vote(@Request() req, @Body() voteDto: VoteDTO): Promise<void> {
        const userId = req.user.userId;
        await this.votingService.vote(userId, voteDto);
    }

    @Get('getVotes')
    @ApiOperation({ summary: 'Get all votes (Admin only)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiResponse({ status: 200, description: 'Returns all votes', type: [VotingSummaryDTO] })
    async getVotes(): Promise<VotingSummaryDTO[]> {
        return this.votingService.getVotesSummary();
    }

    @Get('getVotesForUser')
    @ApiOperation({ summary: 'Get all votes for current user' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiResponse({ status: 200, description: 'Returns all votes for user', type: [PhotocosplayDTO] })
    async getVotesForUser(@Request() req): Promise<PhotocosplayDTO[]> {
        const userId = req.user.userId;
        return this.votingService.getVotesForUser(userId);
    }
}
