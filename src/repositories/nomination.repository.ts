// nomination.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Nomination } from '../entity/festival/nomination.entity';

@Injectable()
export class NominationRepository {
    constructor(
        @InjectRepository(Nomination) private readonly nominationRepository: Repository<Nomination>,
    ) { }

    async getAll(): Promise<Nomination[]> {
        return await this.nominationRepository.find();
    }

    async getAllWithApplications(): Promise<Nomination[]> {
        const nominations = await this.nominationRepository
          .createQueryBuilder('nomination')
          .leftJoinAndSelect('nomination.subNominations', 'subNominations')
          .leftJoinAndSelect('subNominations.applications', 'applications')
          .orderBy('subNominations.order', 'ASC')
          .addOrderBy('nomination.order', 'ASC')
          .getMany();
      
        return nominations;
      }

    async get(id: string): Promise<Nomination | undefined> {
        return await this.nominationRepository.findOne({
            where: {
                nominationId: id,
            },
            relations: ['nominationFields', 'nominationFields.field', 'subNominations']
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
