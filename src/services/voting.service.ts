import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vote } from "../entity/festival/vote.entity";
import { Repository } from "typeorm";
import { VoteDTO } from "../dto/vote.dto";
import { Application } from "../entity/festival/application.entity";
import { PhotocosplayDTO } from "../dto/photocosplay.dto";

@Injectable()
export class VotingService {
    constructor(@InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
        @InjectRepository(Application) private readonly applicationRepository: Repository<Application>) { }

    async vote(userId: string, voteDto: VoteDTO) {
        const { applicationId, rating } = voteDto;
        if (rating > 10 || rating < 0) {
            throw new BadRequestException('Vote should be between 0 and 10');
        }

        if (!applicationId) {
            throw new BadRequestException("ApplicationId is not provided");
        }

        let vote = await this.voteRepository.findOne({ where: { userId, applicationId } });

        if (!vote) {
            const application = await this.applicationRepository.findOne({ where: { applicationId } });
            if (!application) {
                throw new Error(`Application ${applicationId} doesn't exist`);
            }

            vote = this.voteRepository.create();
            vote.userId = userId;
            vote.applicationId = applicationId;
        }

        vote.rating = rating;
        await this.voteRepository.save(vote);
    }

    async getVotes(): Promise<PhotocosplayDTO[]> {
        const votes = await this.voteRepository.find();
        const applications = await this.applicationRepository.find({ where: { subNominationId: '45841f7c-222e-4947-b6b7-209d69bb2611' }, relations: ['applicationData', 'applicationData.field'] });
        const photocosplayDTOs: PhotocosplayDTO[] = [];
        for (const application of applications) {
            let photocosplayDTO = photocosplayDTOs.find(res => res.applicationId === application.applicationId);
            if (!photocosplayDTO) {
                photocosplayDTO = this.getPhotocosplayDTO(application);
                photocosplayDTOs.push(photocosplayDTO);
            }

            const applicationVotes = votes.filter(vote => vote.applicationId === application.applicationId);
            photocosplayDTO.rating = applicationVotes.reduce((accumulator, currentValue) => accumulator + currentValue.rating, 0);
        }

        return photocosplayDTOs;
    }

    private getPhotocosplayDTO(application: Application): PhotocosplayDTO {
        return {
            applicationId: application.applicationId,
            character: application.applicationData.find(data => data.field?.code === "char_name")?.value,
            fandom: application.applicationData.find(data => data.field?.code === "fandom")?.value,
            photographer: application.applicationData.find(data => data.field?.code === "nick_photographer")?.value,
            cosplayer: application.applicationData.find(data => data.field?.code === "nick_model")?.value,
            imageUrl: application.applicationData.find(data => data.field?.code === "char_pic")?.value,
            photo1Url: application.applicationData.find(data => data.field?.code === "photocosplay_1")?.value,
            photo2Url: application.applicationData.find(data => data.field?.code === "photocosplay_2")?.value,
            photo3Url: application.applicationData.find(data => data.field?.code === "photocosplay_3")?.value,
            rating: 0,
        };
    }


}