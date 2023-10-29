import { BadRequestException, Injectable } from '@nestjs/common';
import { NominationRepository } from '../repositories/nomination.repository';
import { Nomination } from '../entity/festival/nomination.entity';
import { FieldRepository } from '../repositories/field.repository'; // Import the FieldRepository
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { NominationField } from '../entity/festival/nomination-fields.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NominationService {
    constructor(
        private readonly nominationRepository: NominationRepository,
        private readonly fieldRepository: FieldRepository,
        @InjectRepository(NominationField) private readonly nominationFieldRepository: Repository<NominationField>
    ) { }

    async getAllNominations() {
        return await this.nominationRepository.getAll();
    }

    async getAllNominationsWithApplications()
    {
        return await this.nominationRepository.getAllWithApplications();
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

    async getFields(nominationId: string): Promise<NominationField[]> {
        const nomination = await this.getNominationById(nominationId);
        return nomination.nominationFields;
    }

    async updateFieldOrder(nominationId: string, fieldId: string, order: number)
    {
        const nomination = await this.nominationRepository.get(nominationId);
        const nominationField = nomination.nominationFields.find(p=>p.fieldId==fieldId);
        if (!nominationField) throw new BadRequestException(`Field ${fieldId} does not exist in nomination ${nominationId}`);
        nominationField.order = order;
        await this.updateNomination(nomination);
    }

    async addFieldToNomination(nominationId: string, fieldId: string, order: number) {
        const nomination = await this.nominationRepository.get(nominationId);
        if (!nomination) {
            throw new Error('Nomination not found');
        }

        const field = await this.fieldRepository.get(fieldId);
        if (!field) {
            throw new Error('Field not found');
        }

        if (nomination.nominationFields.some(p => p.fieldId === fieldId)) {
            throw new Error('Nomination already contains this field');
        }

        const nominationField = new NominationField();
        nominationField.fieldId = fieldId;
        nominationField.nominationId = nominationId;
        nominationField.order = order;
        const newNominationField = this.nominationFieldRepository.create(nominationField);
        await this.nominationFieldRepository.save(newNominationField);
    }

    async removeFieldFromNomination(nominationId: string, fieldId: string) {
        const nominationField = await this.nominationFieldRepository.findOne({where:{nominationId,fieldId}});
        await this.nominationFieldRepository.delete(nominationField);
    }
}
