import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/website/user';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | undefined> {
        return await this.userRepository.findOne({
            where: {
                email,
            }
        });
    }

    async findByConfirmationCode(confirmationCode:string) : Promise<User | undefined> {
        return await this.userRepository.findOne({
            where: {
                emailConfirmationToken: confirmationCode,
            }
        });
    }

    async create(user: User): Promise<User> {
        const newUser = this.userRepository.create(user);
        return await this.userRepository.save(newUser);
    }

    async findById(id: string): Promise<User | undefined> {
        if (!id) return;
        return await this.userRepository.findOne({ where: { userId: id } });
    }

    async findByVkId(id: string): Promise<User | undefined> {
        if (!id) return;
        return await this.userRepository.findOne({ where: { vkId: id } });
    }

    async update(user: User): Promise<User> {
        await this.userRepository.update(user.userId, user);
        return this.findById(user.userId);
    }
}
