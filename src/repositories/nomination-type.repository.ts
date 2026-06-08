import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NominationType } from '../entity/festival/nomination-type.entity';

@Injectable()
export class NominationTypeRepository {
    constructor(
        @InjectRepository(NominationType) private readonly nominationTypeRepository: Repository<NominationType>,
    ) { }

    async getAll(): Promise<NominationType[]> {
        return await this.nominationTypeRepository.find();
    }

    async get(id: string): Promise<NominationType | null> {
        return await this.nominationTypeRepository.findOne({
            where: {
                nominationTypeId: id,
            }
        });
    }

    async create(nominationData: Partial<NominationType>): Promise<NominationType> {
        const nominationType = this.nominationTypeRepository.create(nominationData);
        return await this.nominationTypeRepository.save(nominationType);
    }

    async update(nominationType: NominationType): Promise<NominationType | null> {
        await this.nominationTypeRepository.save(nominationType);
        return this.get(nominationType.nominationTypeId);
    }

    async remove(id: string): Promise<void> {
        await this.nominationTypeRepository.delete(id);
    }
}
