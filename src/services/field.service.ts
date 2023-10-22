import { BadRequestException, Injectable } from '@nestjs/common';
import { FieldRepository } from '../repositories/field.repository';
import { Field } from '../entity/festival/field.entity';

@Injectable()
export class FieldService {
    constructor(private readonly fieldRepository: FieldRepository) { }

    async getAllFields(): Promise<Field[]> {
        return this.fieldRepository.getAll();
    }

    async getFieldById(id: string): Promise<Field | undefined> {
        return this.fieldRepository.get(id);
    }

    async createField(fieldData: Partial<Field>): Promise<Field> {
        const fieldWithSameCode = await this.fieldRepository.getByCode(fieldData.code);
        if (!!fieldWithSameCode) throw new BadRequestException(`Field with code ${fieldData.code} already exist`)
        return this.fieldRepository.create(fieldData);
    }

    async updateField(id: string, fieldData: Partial<Field>): Promise<Field | undefined> {
        return this.fieldRepository.update(id, fieldData);
    }

    async deleteField(id: string): Promise<void> {
        return this.fieldRepository.remove(id);
    }
}