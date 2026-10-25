import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ApplicationFile } from '../entity/website/application-file.entity';
import { UserService } from './user.service';
import { Application } from '../entity/festival/application.entity';
import { assertApplicationAccess, getApplicationAccess } from '../utils/application-access';

type UploadedFile = {
    filename: string;
};

@Injectable()
export class FileService {
    constructor(
        @InjectRepository(ApplicationFile)
        private readonly fileRepository: Repository<ApplicationFile>,
        private readonly userService: UserService,
        private readonly dataSource: DataSource,
    ) {}

    async getById(fileId: string): Promise<ApplicationFile | null> {
        const file = await this.fileRepository.findOne({ where: { id: fileId } });
        return file;
    }

    async getByFileName(fileName: string): Promise<ApplicationFile | null> {
        const file = await this.fileRepository.findOne({ where: { fileName } });
        return file;
    }

    async saveApplicationId(fileName: string, applicationId: string): Promise<void> {
        const file = await this.fileRepository.findOne({ where: { fileName } });
        if (!file) {
            throw new NotFoundException('File not found');
        }

        file.applicationId = applicationId;
        await this.fileRepository.save(file);
    }

    async uploadFile(file: UploadedFile, userId: string): Promise<ApplicationFile> {
        const newFile = new ApplicationFile();
        newFile.fileName = `${file.filename}`;
        newFile.userId = userId;

        const savedFile = await this.fileRepository.save(newFile);
        return savedFile;
    }

    async attachFile(manager: EntityManager, fileName: string, applicationId: string, userId: string): Promise<void> {
        const file = await manager.findOne(ApplicationFile, { where: { fileName }, lock: { mode: 'pessimistic_write' } });
        if (!file || (file.applicationId && file.applicationId !== applicationId) || (!file.applicationId && file.userId !== userId)) {
            throw new ForbiddenException('Файл недоступен для этой заявки');
        }
        try {
            await fs.access(path.join(process.env.UPLOAD_PATH ?? './uploads', file.fileName));
        } catch {
            throw new BadRequestException('Прикрепляемый файл не найден');
        }
        file.applicationId = applicationId;
        await manager.save(ApplicationFile, file);
    }

    async deleteFile(fileId: string, userId: string, applicationId?: string, scope?: unknown): Promise<void> {
        const file = await this.fileRepository.findOne({ where: { id: fileId } });

        if (!file) {
            throw new NotFoundException('File not found');
        }

        // Check if the user trying to delete the file is the same as the user who uploaded it
        const user = await this.userService.findById(userId);
        if (applicationId || (user?.isFoyerCoordinator && !user.isAdmin) || scope === 'foyer') {
            if (!applicationId || file.applicationId !== applicationId) throw new ForbiddenException('Файл не принадлежит заявке');
            const access = getApplicationAccess(user, scope);
            const application = await this.dataSource.getRepository(Application).findOneBy({ applicationId });
            if (!application) throw new ForbiddenException('Заявка недоступна');
            await assertApplicationAccess(this.dataSource.manager, access, application);
        } else if (file.userId !== userId && !user?.isAdmin) {
            throw new ForbiddenException('You do not have permission to delete this file');
        }

        const uploadFolder = process.env.UPLOAD_PATH ?? './uploads';

        // Delete the file from the file system
        await fs.unlink(path.join(uploadFolder, file.fileName));

        // Delete the file from the database
        await this.fileRepository.delete(fileId);
    }
}
