import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Vote } from "../entity/festival/vote.entity";
import { Application, ApplicationState } from "../entity/festival/application.entity";
import { StageVote } from "../entity/festival/stage-vote.entity";
import { SubNomination } from "../entity/festival/sub-nomination.entity";
import { VoteDTO } from "../dto/vote.dto";
import { VoteViewDTO } from "../dto/vote-view.dto";
import { VotingSummaryDTO } from "../dto/voting-summary.dto";
import { StageVoteSummaryDTO } from "../dto/stage-vote-summary.dto";
import { NOMINATION_PUBLIC_FIELDS_FOR_VOTING } from "../constants/nomination-public-fields-for-voting";

@Injectable()
export class VotingService {
    constructor(
        @InjectRepository(Vote)
        private readonly voteRepository: Repository<Vote>,
        
        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
        
        @InjectRepository(StageVote)
        private readonly stageVoteRepository: Repository<StageVote>,
        
        @InjectRepository(SubNomination)
        private readonly subNominationRepository: Repository<SubNomination>
    ) {}

    async vote(userId: string, voteDto: VoteDTO): Promise<void> {
        const { applicationId, rating } = voteDto;

        if (rating < 0 || rating > 10) {
            throw new BadRequestException('Vote should be between 0 and 10');
        }

        if (!applicationId) {
            throw new BadRequestException("ApplicationId is not provided");
        }

        const [vote, application] = await Promise.all([
            this.voteRepository.findOne({ where: { userId, applicationId } }),
            this.applicationRepository.findOne({ where: { applicationId }, relations: ['subNomination'] }),
        ]);

        if (!application) {
            throw new BadRequestException(`Application ${applicationId} doesn't exist`);
        }

        if (!vote) {
            const subNominationCode = application.subNomination?.code;
            if (!subNominationCode || !this.isSubNominationInVoting(subNominationCode)) {
                throw new BadRequestException(`Sub nomination ${subNominationCode} is not in voting`);
            }
            const newVote = this.voteRepository.create({ userId, applicationId, rating });
            await this.voteRepository.save(newVote);
            return;
        }

        vote.rating = rating;
        await this.voteRepository.save(vote);
    }

    async getVotesForUser(subNominationCode: string, userId: string | null): Promise<VoteViewDTO[]> {
        if (!this.isSubNominationInVoting(subNominationCode)) {
            throw new BadRequestException(`Sub nomination ${subNominationCode} is not in voting`);
        }

        const applications = await this.applicationRepository.find({
            where: { subNomination: { code: subNominationCode }, state: ApplicationState.Accepted },
            relations: ['applicationData', 'applicationData.field'],
        });

        const voteViewDTOs: VoteViewDTO[] = applications.map(application => this.getVoteViewDTO(application));

        if (userId) {
            const userVotes = await this.voteRepository.find({
                where: { userId, applicationId: In(applications.map(app => app.applicationId)) },
            });
            const userVoteMap = new Map(userVotes.map(vote => [vote.applicationId, vote.rating]));

            voteViewDTOs.forEach(dto => {
                dto.rating = userVoteMap.get(dto.applicationId) ?? 0;
            });
        }

        return voteViewDTOs;
    }

    async getVotesSummary(subNominationCode: string): Promise<VotingSummaryDTO[]> {
        if (!this.isSubNominationInVoting(subNominationCode)) {
            throw new BadRequestException(`Sub nomination ${subNominationCode} is not in voting`);
        }

        const [votes, applications] = await Promise.all([
            this.voteRepository.find(),
            this.applicationRepository.find({
                where: { subNomination: { code: subNominationCode }, state: ApplicationState.Accepted },
                relations: ['applicationData', 'applicationData.field'],
            }),
        ]);

        const voteMap = votes.reduce((acc, vote) => {
            if (!acc[vote.applicationId]) {
                acc[vote.applicationId] = { totalRating: 0, count: 0 };
            }
            acc[vote.applicationId].totalRating += vote.rating;
            acc[vote.applicationId].count += 1;
            return acc;
        }, {} as Record<string, { totalRating: number; count: number }>);

        return applications.map(application => {
            const { totalRating = 0, count = 0 } = voteMap[application.applicationId] || {};
            return {
                applicationId: application.applicationId,
                fullName: application.fullName,
                rating: count > 0 ? totalRating / count : 0,
                voteCount: count,
            };
        });
    }

    async toggleStageVote(applicationId: string, userId: string): Promise<void> {
        const existingVote = await this.stageVoteRepository.findOne({ where: { applicationId, userId } });

        if (existingVote) {
            await this.stageVoteRepository.remove(existingVote);
        } else {
            const newVote = this.stageVoteRepository.create({ applicationId, userId });
            await this.stageVoteRepository.save(newVote);
        }
    }

    async getStageVoteSummary(): Promise<StageVoteSummaryDTO[]> {
        const voteResults = await this.stageVoteRepository
            .createQueryBuilder('stageVote')
            .select('stageVote.applicationId', 'applicationId')
            .addSelect('COUNT(stageVote.userId)', 'voteCount')
            .groupBy('stageVote.applicationId')
            .getRawMany<StageVoteSummaryDTO>();

        return voteResults;
    }

    private isSubNominationInVoting(subNominationCode: string): boolean {
        return NOMINATION_PUBLIC_FIELDS_FOR_VOTING.some(nomination => nomination.code === subNominationCode);
    }

    private getVoteViewDTO(application: Application): VoteViewDTO {
        return {
            applicationId: application.applicationId,
            fields: this.mapApplicationDataToRecord(application.applicationData),
            rating: 0,
        };
    }

    private mapApplicationDataToRecord(applicationData: { field: { code: string }, value: string }[]): Record<string, string> {
        return applicationData.reduce<Record<string, string>>((acc, data) => {
            acc[data.field.code] = data.value;
            return acc;
        }, {});
    }
}
