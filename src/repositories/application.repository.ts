import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '../entity/festival/application.entity';

@Injectable()
export class ApplicationRepository {
    constructor(@InjectRepository(Application) private readonly applicationRepository: Repository<Application>) {}

    async getAll(): Promise<Application[]> {
        return await this.applicationRepository.find({ relations: ['applicationData', 'applicationData.field', 'participants', 'sourceParticipant', 'subNomination', 'subNomination.nomination'] });
    }

    async get(id: string): Promise<Application | null> {
        return await this.applicationRepository.findOne({
            where: {
                applicationId: id,
            },
            relations: ['subNomination', 'subNomination.nomination', 'subNomination.nomination.nominationType', 'applicationData', 'participants', 'sourceParticipant'],
        });
    }

    async getByUserId(userId: string): Promise<Application[]> {
        return await this.applicationRepository.find({
            where: { userId },
            relations: ['applicationData', 'applicationData.field', 'subNomination', 'subNomination.nomination', 'subNomination.nomination.nominationType', 'participants', 'sourceParticipant'],
        });
    }

    async create(applicationData: Partial<Application>): Promise<Application> {
        const application = this.applicationRepository.create(applicationData);
        return await this.applicationRepository.save(application);
    }

    async update(application: Application): Promise<Application | null> {
        await this.applicationRepository.save(application);
        return this.get(application.applicationId);
    }

    async remove(id: string): Promise<void> {
        await this.applicationRepository.delete(id);
    }
}
