import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ApplicationFile } from '../entity/website/application-file.entity';

type UploadedFile = {
  filename: string;
};

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(ApplicationFile)
    private readonly fileRepository: Repository<ApplicationFile>,
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

  async uploadFile(file: UploadedFile, userId: number): Promise<ApplicationFile> {
    const newFile = new ApplicationFile();
    newFile.fileName = `${file.filename}`;
    newFile.userId = userId;

    const savedFile = await this.fileRepository.save(newFile);
    return savedFile;
  }

  async deleteFile(fileId: string, userId: number): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check if the user trying to delete the file is the same as the user who uploaded it
    if (file.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    const uploadFolder = process.env.UPLOAD_PATH ?? './uploads';

    // Delete the file from the file system
    await fs.unlink(path.join(uploadFolder, file.fileName));

    // Delete the file from the database
    await this.fileRepository.delete(fileId);
  }
}
