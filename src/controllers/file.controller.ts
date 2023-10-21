import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile, Body, Request, NotFoundException, ForbiddenException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { FileService } from '../services/file.service';
import { ApplicationFile } from '../entity/website/application-file.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin-guard';

@Controller('api/files')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 3 * 1024 * 1024 } })) // 'file' is the field name for the uploaded file
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ): Promise<ApplicationFile> {
        const userId = req.user.userId;
        return this.fileService.uploadFile(file, userId);
    }

    @UseGuards(AdminGuard)
    @Delete(':id')
    async deleteFile(@Param('id') fileId: string, @Request() req) {
        const userId = req.user.id; // Get the user ID from the JWT token payload

        try {
            const deletedFile = await this.fileService.deleteFile(fileId, userId);
            return { message: 'File deleted successfully' };
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw new NotFoundException('File not found');
            }
            if (err instanceof ForbiddenException) {
                throw new ForbiddenException('You do not have permission to delete this file');
            }
            throw err;
        }
    }
}
