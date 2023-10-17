import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Field } from "../entity/festival/field.entity";
import { Repository } from "typeorm";

@Injectable()
export class FieldRepository {
    constructor(
        @InjectRepository(Field) private readonly fieldRepository: Repository<Field>,
    ) { }

    async getAll(): Promise<Field[]> {
        return await this.fieldRepository.find();
    }

    async get(id: string): Promise<Field | undefined> {
        return await this.fieldRepository.findOne({
            where: {
                fieldId: id,
            }
        });
    }

    async create(fieldData: Partial<Field>): Promise<Field> {
        const field = this.fieldRepository.create(fieldData);
        return await this.fieldRepository.save(field);
    }

    async update(id: string, fieldData: Partial<Field>): Promise<Field | undefined> {
        await this.fieldRepository.update(id, fieldData);
        return this.get(id);
    }

    async remove(id: string): Promise<void> {
        await this.fieldRepository.delete(id);
    }
}