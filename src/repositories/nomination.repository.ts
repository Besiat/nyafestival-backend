// nomination.repository.ts
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Nomination } from '../entity/festival/nomination.entity';
import { ApplicationAccess, FOYER_TYPE_CODES } from '../utils/application-access';

@Injectable()
export class NominationRepository {
    constructor(@InjectRepository(Nomination) private readonly nominationRepository: Repository<Nomination>) {}

    async getAll(): Promise<Nomination[]> {
        return await this.nominationRepository.find();
    }

    async getForReview(access: ApplicationAccess): Promise<Nomination[]> {
        return this.nominationRepository.find({
            where: access.foyer ? { nominationType: { code: In([...FOYER_TYPE_CODES]) } } : {},
            relations: ['nominationType', 'subNominations', 'nominationFields', 'nominationFields.field'],
            order: { order: 'ASC', subNominations: { order: 'ASC' } },
        });
    }

    async getAllWithApplications(access?: ApplicationAccess): Promise<Nomination[]> {
        const query = this.nominationRepository
            .createQueryBuilder('nomination')
            .leftJoinAndSelect('nomination.nominationType', 'nominationType')
            .leftJoinAndSelect('nomination.subNominations', 'subNominations')
            .leftJoinAndSelect('subNominations.applications', 'applications')
            .leftJoinAndSelect('applications.participants', 'participants')
            .leftJoinAndSelect('applications.sourceParticipant', 'sourceParticipant')
            .orderBy('subNominations.order', 'ASC')
            .addOrderBy('nomination.order', 'ASC');
        if (access?.foyer) query.andWhere('nominationType.code IN (:...foyerCodes)', { foyerCodes: [...FOYER_TYPE_CODES] });
        return query.getMany();
    }

    async get(id: string): Promise<Nomination | undefined> {
        return await this.nominationRepository.findOne({
            where: {
                nominationId: id,
            },
            relations: ['nominationFields', 'nominationFields.field', 'subNominations'],
        });
    }

    async create(nominationData: Partial<Nomination>): Promise<Nomination> {
        const nomination = this.nominationRepository.create(nominationData);
        return await this.nominationRepository.save(nomination);
    }

    async update(nomination: Nomination): Promise<Nomination | undefined> {
        await this.nominationRepository.save(nomination);
        return this.get(nomination.nominationId);
    }

    async remove(id: string): Promise<void> {
        await this.nominationRepository.delete(id);
    }
}
