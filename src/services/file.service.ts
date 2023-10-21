import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ApplicationFile } from '../entity/website/application-file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(ApplicationFile)
    private readonly fileRepository: Repository<ApplicationFile>,
  ) { }

  async getById(fileId: string): Promise<ApplicationFile | undefined> {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    return file
  }

  async saveApplicationId(fileId: string, applicationId: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    file.applicationId = applicationId;
    await this.fileRepository.save(file);
  }

  async uploadFile(file: Express.Multer.File, userId: number): Promise<ApplicationFile> {
    const uploadFolder = process.env.UPLOAD_PATH;

    const newFile = new ApplicationFile();
    newFile.fileName = `${file.filename}`;
    newFile.userId = userId;

    const savedFile = await this.fileRepository.save(newFile);
    return savedFile;
  }

  async deleteFile(fileId: string, userId: number) {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check if the user trying to delete the file is the same as the user who uploaded it
    if (file.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    const uploadFolder = process.env.UPLOAD_PATH;

    // Delete the file from the file system
    fs.unlinkSync(path.join(uploadFolder, file.id.toString()));

    // Delete the file from the database
    await this.fileRepository.delete(fileId);
  }
}
