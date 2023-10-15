import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../entity/website/user';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findByEmail(email);
    }

    async create(user: User): Promise<User> {
        return this.userRepository.create(user);
    }

    async findById(id: string): Promise<User | undefined> {
        if (!id) throw new BadRequestException('Id is empty');
        return this.userRepository.findById(id);
    }

    async findByVkId(id: string): Promise<User | undefined> {
        return this.userRepository.findByVkId(id);
    }

    async update(user:User): Promise<User> {
        return this.userRepository.update(user);
    }
}
