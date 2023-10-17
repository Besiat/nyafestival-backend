import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubNomination } from '../entity/festival/sub-nomination.entity';

@Injectable()
export class SubNominationRepository {
    constructor(
        @InjectRepository(SubNomination)
        private readonly subNominationRepository: Repository<SubNomination>,
    ) { }

    async getAll(): Promise<SubNomination[]> {
        return await this.subNominationRepository.find();
    }

    async get(id: string): Promise<SubNomination | undefined> {
        return await this.subNominationRepository.findOne({ where: { subNominationId: id } });
    }

    async create(subNominationData: Partial<SubNomination>): Promise<SubNomination> {
        const subNomination = this.subNominationRepository.create(subNominationData);
        return await this.subNominationRepository.save(subNomination);
    }

    async update(id: string, subNominationData: Partial<SubNomination>): Promise<SubNomination | undefined> {
        await this.subNominationRepository.update(id, subNominationData);
        return this.get(id);
    }

    async remove(id: string): Promise<void> {
        await this.subNominationRepository.delete(id);
    }
}
