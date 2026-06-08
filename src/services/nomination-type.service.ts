import { Injectable } from '@nestjs/common'
import { NominationType } from '../entity/festival/nomination-type.entity'
import { NominationTypeRepository } from '../repositories/nomination-type.repository'

@Injectable()
export class NominationTypeService {
  constructor(
    private readonly nominationTypeRepository: NominationTypeRepository,
  ) {}

  async getAllNominationTypes(): Promise<NominationType[]> {
    return await this.nominationTypeRepository.getAll()
  }

  async getNominationTypeById(id: string): Promise<NominationType | null> {
    return await this.nominationTypeRepository.get(id)
  }

  async createNominationType(
    nominationTypeData: Partial<NominationType>,
  ): Promise<NominationType> {
    return await this.nominationTypeRepository.create(nominationTypeData)
  }

  async updateNominationType(
    nominationType: NominationType,
  ): Promise<NominationType | null> {
    return await this.nominationTypeRepository.update(nominationType)
  }

  async deleteNominationType(id: string): Promise<void> {
    await this.nominationTypeRepository.remove(id)
  }
}
