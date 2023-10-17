import { Injectable } from '@nestjs/common';
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { SubNominationRepository } from '../repositories/sub-nomination.repository';

@Injectable()
export class SubNominationService {
  constructor(private readonly subNominationRepository: SubNominationRepository) {}

  async getAllSubNominations() {
    return await this.subNominationRepository.getAll();
  }

  async getSubNominationById(id: string) {
    return await this.subNominationRepository.get(id);
  }

  async createSubNomination(subNominationData: Partial<SubNomination>) {
    return await this.subNominationRepository.create(subNominationData);
  }

  async updateSubNomination(id: string, subNominationData: Partial<SubNomination>) {
    return await this.subNominationRepository.update(id, subNominationData);
  }

  async deleteSubNomination(id: string) {
    await this.subNominationRepository.remove(id);
  }
}
