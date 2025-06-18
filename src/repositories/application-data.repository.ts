import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationData } from '../entity/festival/application-data.entity';

@Injectable()
export class ApplicationDataRepository {
    constructor(
        @InjectRepository(ApplicationData) private readonly applicationDataRepository: Repository<ApplicationData>,
    ) { }

    async getAll(): Promise<ApplicationData[]> {
        return await this.applicationDataRepository.find();
    }

    async get(id: string): Promise<ApplicationData | undefined> {
        return await this.applicationDataRepository.findOne({
            where: {
                applicationDataId: id,
            },
            //relations: ['application', 'field'],
        });
    }

    async getByApplicationId(applicationId: string): Promise<ApplicationData[]> {
        return this.applicationDataRepository.find({ where: { applicationId }, relations: ['field'] })
    }

    async create(applicationData: Partial<ApplicationData>): Promise<ApplicationData> {
        const data = this.applicationDataRepository.create(applicationData);
        return await this.applicationDataRepository.save(data);
    }

    async update(applicationData: ApplicationData): Promise<ApplicationData | undefined> {
        await this.applicationDataRepository.save(applicationData);
        return this.get(applicationData.applicationDataId);
    }

    async remove(id: string): Promise<void> {
        await this.applicationDataRepository.delete(id);
    }

   async getApplicationsWithFieldValues(fieldCodes: string[]): Promise<{ applicationId: string; value: string }[]> {
    return await this.applicationDataRepository
        .createQueryBuilder('applicationData')
        .select('application.applicationId', 'applicationId')
        .addSelect('applicationData.value', 'value')
        .innerJoin(
            'application',
            'application',
            'application.applicationId = applicationData.applicationId',
        )
        .innerJoin('field', 'field', 'field.fieldId = applicationData.fieldId')
        .where('application.state = :state', { state: 4 })
        .andWhere('field.code IN (:...codes)', { codes: fieldCodes }) // multiple field codes
        .andWhere('applicationData.value != :empty', { empty: '' }) // exclude empty values
        .getRawMany();
    }
}
