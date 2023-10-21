import { Injectable } from '@nestjs/common';
import { NominationRepository } from '../repositories/nomination.repository';
import { Nomination } from '../entity/festival/nomination.entity';
import { FieldRepository } from '../repositories/field.repository'; // Import the FieldRepository
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { Field } from '../entity/festival/field.entity';

@Injectable()
export class NominationService {
    constructor(
        private readonly nominationRepository: NominationRepository,
        private readonly fieldRepository: FieldRepository, // Inject the FieldRepository
    ) { }

    async getAllNominations() {
        return await this.nominationRepository.getAll();
    }

    async getNominationById(id: string) {
        return await this.nominationRepository.get(id);
    }

    async createNomination(nominationData: Partial<Nomination>) {
        return await this.nominationRepository.create(nominationData);
    }

    async updateNomination(nomination: Nomination) {
        return await this.nominationRepository.update(nomination);
    }

    async deleteNomination(id: string) {
        await this.nominationRepository.remove(id);
    }

    async getSubNominations(nominationId: string): Promise<SubNomination[]> {
        const nomination = await this.getNominationById(nominationId);
        return nomination.subNominations;
    }

    async getFields(nominationId: string): Promise<Field[]> {
        const nomination = await this.getNominationById(nominationId);
        return nomination.fields;
    }

    async addFieldToNomination(nominationId: string, fieldId: string) {
        const nomination = await this.nominationRepository.get(nominationId);
        if (!nomination) {
            throw new Error('Nomination not found');
        }

        const field = await this.fieldRepository.get(fieldId);
        if (!field) {
            throw new Error('Field not found');
        }

        if (nomination.fields.some(p => p.fieldId === fieldId)) {
            throw new Error('Nomination already contains this field');
        }

        nomination.fields.push(field);
        await this.updateNomination(nomination);
    }

    async removeFieldFromNomination(nominationId: string, fieldId: string) {
        const nomination = await this.nominationRepository.get(nominationId);
        if (!nomination) {
            throw new Error('Nomination not found');
        }

        const fieldIndex = nomination.fields.findIndex((field) => field.fieldId === fieldId);
        if (fieldIndex === -1) {
            throw new Error('Field not found in the nomination');
        }

        nomination.fields.splice(fieldIndex, 1);
        await this.updateNomination(nomination);
    }
}
