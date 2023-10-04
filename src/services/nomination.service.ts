import { Injectable } from '@nestjs/common';
import { NominationRepository } from '../repositories/nomination.repository';
import { Nomination } from '../entity/festival/nomination.entity';

@Injectable()
export class NominationService {
    constructor(private readonly nominationRepository: NominationRepository) { }

    async getAllNominations() {
        return await this.nominationRepository.getAll();
    }

    async getNominationById(id: string) {
        return await this.nominationRepository.get(id);
    }

    async createNomination(nominationData: Partial<Nomination>) {
        return await this.nominationRepository.create(nominationData);
    }

    async updateNomination(id: string, nominationData: Partial<Nomination>) {
        return await this.nominationRepository.update(id, nominationData);
    }

    async deleteNomination(id: string) {
        await this.nominationRepository.remove(id);
    }
}
