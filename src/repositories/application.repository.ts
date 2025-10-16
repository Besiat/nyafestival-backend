import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '../entity/festival/application.entity';

@Injectable()
export class ApplicationRepository {
    constructor(
        @InjectRepository(Application) private readonly applicationRepository: Repository<Application>,
    ) { }

    async getAll(): Promise<Application[]> {
        return await this.applicationRepository.find({ relations: ['applicationData', 'applicationData.field'] });
    }

    async get(id: string): Promise<Application | undefined> {
        return await this.applicationRepository.findOne({
            where: {
                applicationId: id,
            },
            relations: ['subNomination', 'subNomination.nomination', 'applicationData'],
        });
    }

    async getByUserId(userId: string): Promise<Application[]> {
        return await this.applicationRepository.find({ where: { userId }, relations: ['applicationData', 'subNomination', 'subNomination.nomination'] });
    }

    async create(applicationData: Partial<Application>): Promise<Application> {
        const application = this.applicationRepository.create(applicationData);
        return await this.applicationRepository.save(application);
    }

    async update(application: Application): Promise<Application | undefined> {
        await this.applicationRepository.save(application);
        return this.get(application.applicationId);
    }

    async remove(id: string): Promise<void> {
        await this.applicationRepository.delete(id);
    }
}
