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

    async get(id: string): Promise<Nomination | undefined> {
        return await this.nominationRepository.findOne({
            where: {
                nominationId: id,
            }
        });
    }

    async create(nominationData: Partial<Nomination>): Promise<Nomination> {
        const nomination = this.nominationRepository.create(nominationData);
        return await this.nominationRepository.save(nomination);
    }

    async update(id: string, nominationData: Partial<Nomination>): Promise<Nomination | undefined> {
        await this.nominationRepository.update(id, nominationData);
        return this.get(id);
    }

    async remove(id: string): Promise<void> {
        await this.nominationRepository.delete(id);
    }
}