import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { DataSource } from 'typeorm';
import { Application } from '../entity/festival/application.entity';
import { ApplicationData } from '../entity/festival/application-data.entity';
import { ApplicationRepository } from '../repositories/application.repository';
import { ApplicationDataRepository } from '../repositories/application-data.repository';
import { SubNominationService } from './sub-nomination.service';
import { NominationService } from './nomination.service';
import { FileService } from './file.service';
import { RegisterApplicationDTO } from '../dto/register-application.dto';
import { UpdateApplicationByUserDTO } from '../dto/update-application-by-user.dto';
import { FieldType } from '../enums/fieldType';
import { ApplicationState } from '../entity/festival/application.entity';
import { Field } from '../entity/festival/field.entity';
import { ApplicationDataDTO } from '../dto/application-data.dto';
import { UserService } from './user.service';
import { withPublicApplicationState } from '../utils/application-public-state';
import { FieldService } from './field.service';
import { UpdateApplicationByAdminDTO } from '../dto/update-application-by-admin.dto';

@Injectable()
export class ApplicationService {
    private readonly logger = new Logger(ApplicationService.name);

    constructor(
        private readonly subNominationService: SubNominationService,
        private readonly nominationService: NominationService,
        private readonly applicationRepository: ApplicationRepository,
        private readonly applicationDataRepository: ApplicationDataRepository,
        private readonly fileService: FileService,
        private readonly fieldService: FieldService,
        private readonly userService: UserService,
        private readonly dataSource: DataSource,
    ) {}

    async getApplications(): Promise<Application[]> {
        return this.applicationRepository.getAll();
    }

    async getByUserId(userId: string): Promise<Application[]> {
        const applications = await this.applicationRepository.getByUserId(userId);
        return applications.map(withPublicApplicationState);
    }

    async getApplicationData(applicationId: string): Promise<ApplicationData[]> {
        const applicationData = await this.applicationDataRepository.getByApplicationId(applicationId);
        const application = await this.applicationRepository.get(applicationId);

        if (!application || !application.subNomination || !application.subNomination.nomination) {
            return applicationData;
        }

        const nominationFields = await this.nominationService.getFields(application.subNomination.nomination.nominationId);

        const fieldOrderMap = new Map<string, number>();
        nominationFields.forEach(nf => {
            fieldOrderMap.set(nf.fieldId, nf.order);
        });

        // TODO: check if this works, I think it doesn't in the admin panel in the frontend
        applicationData.forEach(appData => {
            appData.field.order = fieldOrderMap.get(appData.fieldId) ?? 0;
        });

        return applicationData;
    }

    async registerApplication(userId: string, application: RegisterApplicationDTO) {
        if (!userId) {
            throw new BadRequestException('User is empty');
        }

        const subNomination = await this.getSubNominationOrThrow(application.subNominationId);

        const fields = await this.getNominationFields(subNomination);

        const applicationData = application.applicationData.filter(data => data.value?.trim());
        const applicationDataFiles = this.getUploadApplicationData(applicationData, fields);

        this.validateApplicationData(applicationData, fields);
        await this.validateFiles(applicationDataFiles);

        const savedApplication = await this.createApplicationWithData(userId, subNomination, applicationData, fields);

        await this.linkFilesToApplication(applicationDataFiles, savedApplication.applicationId);
    }

    async updateApplicationByUser(userId: string, updateApplicationDTO: UpdateApplicationByUserDTO): Promise<void> {
        const application = await this.getApplicationOrThrow(updateApplicationDTO.applicationId);

        const user = await this.userService.findById(userId);
        if (user?.userId !== application.userId) {
            throw new BadRequestException(`Different userId`);
        }

        const subNominationId = updateApplicationDTO.subNominationId ?? application.subNominationId;
        const subNomination = await this.getSubNominationOrThrow(subNominationId);

        // keep empty values to allow clear the field
        const updateApplicationData = updateApplicationDTO.applicationData;
        const fields = await this.getNominationFields(subNomination);

        const fileIdsToDelete: string[] = [];

        if (updateApplicationData) {
            this.validateExtraApplicationData(updateApplicationData, fields);
            const updatedApplicationData = this.mergeApplicationData(application.applicationData, updateApplicationData);
            this.validateRequiredApplicationData(updatedApplicationData, fields);

            const applicationDataFiles = this.getUploadApplicationData(updateApplicationData, fields);
            await this.validateFiles(applicationDataFiles);

            for (const updatedAppData of updateApplicationData) {
                const existingAppData = application.applicationData.find(appData => appData.fieldId === updatedAppData.fieldId);
                if (existingAppData) {
                    const field = fields.find(f => f.fieldId === updatedAppData.fieldId);
                    await this.queueOldUploadFileForDeletion(field, existingAppData, updatedAppData.value, fileIdsToDelete);
                    existingAppData.value = updatedAppData.value;
                    await this.applicationDataRepository.update(existingAppData);
                } else {
                    const newAppData = new ApplicationData();
                    newAppData.fieldId = updatedAppData.fieldId;
                    newAppData.application = application;
                    newAppData.value = updatedAppData.value;
                    const createdAppData = await this.applicationDataRepository.create(newAppData);
                    application.applicationData.push(createdAppData);
                }
            }

            await this.linkFilesToApplication(applicationDataFiles, application.applicationId);
        }

        const dtos = this.getApplicationDataDtos(application);

        application.fullName = this.replacePlaceholders(subNomination.nomination.fullNameTemplate, dtos, fields);
        application.subNomination = subNomination;
        application.state = ApplicationState.New;

        await this.applicationRepository.update(application);

        await this.deleteFiles(fileIdsToDelete, userId);
    }

    async updateApplicationByAdmin(
        userId: string,
        applicationId: string,
        updateApplicationDTO: UpdateApplicationByAdminDTO,
    ): Promise<void> {
        const application = await this.getApplicationOrThrow(applicationId);

        const subNominationId = updateApplicationDTO.subNominationId ?? application.subNominationId;
        const subNomination = await this.getSubNominationOrThrow(subNominationId);

        // keep empty values to allow clear the field
        const updateApplicationData = updateApplicationDTO.applicationData;
        const nominationFields = await this.getNominationFields(subNomination);

        const fileIdsToDelete: string[] = [];

        if (updateApplicationData) {
            const fields = await this.fieldService.getAllFields();
            const applicationDataFiles = this.getUploadApplicationData(updateApplicationData, fields);
            await this.validateFiles(applicationDataFiles);

            for (const updatedAppData of updateApplicationData) {
                const existingAppData = application.applicationData.find(appData => appData.fieldId === updatedAppData.fieldId);
                if (existingAppData) {
                    const field = fields.find(f => f.fieldId === updatedAppData.fieldId);
                    await this.queueOldUploadFileForDeletion(field, existingAppData, updatedAppData.value, fileIdsToDelete);
                    existingAppData.value = updatedAppData.value;
                    await this.applicationDataRepository.update(existingAppData);
                }
            }

            await this.linkFilesToApplication(applicationDataFiles, application.applicationId);
        }

        if (updateApplicationDTO.recalculateFullName) {
            application.fullName = this.replacePlaceholders(
                subNomination.nomination.fullNameTemplate,
                this.getApplicationDataDtos(application),
                nominationFields,
            );
        } else {
            application.fullName = updateApplicationDTO.fullName ?? application.fullName;
        }
        application.subNomination = subNomination;

        await this.applicationRepository.update(application);

        await this.deleteFiles(fileIdsToDelete, userId);
    }

    async setApplicationState(applicationId: string, newState: ApplicationState, note?: string): Promise<void> {
        const application = await this.getApplicationOrThrow(applicationId);

        application.state = newState;
        application.adminNote = note && newState === ApplicationState.Invalid ? note : null;
        await this.applicationRepository.update(application);
    }

    async getApplicationDataWithFieldValues(fieldCodes: string[]): Promise<{ applicationId: string; value: string }[]> {
        return await this.applicationDataRepository.getApplicationsWithFieldValues(fieldCodes);
    }

    private async getApplicationOrThrow(applicationId: string): Promise<Application> {
        const application = await this.applicationRepository.get(applicationId);
        if (!application) {
            throw new BadRequestException(`Application not found: ${applicationId}`);
        }

        return application;
    }

    private async getSubNominationOrThrow(subNominationId: string): Promise<Application['subNomination']> {
        const subNomination = await this.subNominationService.getSubNominationById(subNominationId);
        if (!subNomination) {
            throw new BadRequestException(`Subnomination not found: ${subNominationId}`);
        }

        return subNomination;
    }

    private async getNominationFields(subNomination: Application['subNomination']): Promise<Field[]> {
        return (await this.nominationService.getFields(subNomination.nomination.nominationId)).map(nomField => nomField.field);
    }

    private getApplicationDataDtos(application: Application): ApplicationDataDTO[] {
        return application.applicationData.map(appData => {
            return { fieldId: appData.fieldId, value: appData.value };
        });
    }

    private getUploadApplicationData(applicationData: ApplicationDataDTO[], fields: Field[]): ApplicationDataDTO[] {
        const uploadFields = fields.filter(f => this.isUploadField(f));
        return applicationData.filter(data => data.value?.trim() && uploadFields.some(f => f.fieldId === data.fieldId));
    }

    private async queueOldUploadFileForDeletion(
        field: Field | undefined,
        existingAppData: ApplicationData,
        updatedValue: string,
        fileIdsToDelete: string[],
    ): Promise<void> {
        if (!this.isUploadField(field) || existingAppData.value === updatedValue) {
            return;
        }

        const file = await this.fileService.getByFileName(existingAppData.value);
        if (file) {
            fileIdsToDelete.push(file.id);
        }
    }

    private async deleteFiles(fileIds: string[], userId: string): Promise<void> {
        for (const fileId of fileIds) {
            try {
                await this.fileService.deleteFile(fileId, userId);
            } catch (error) {
                this.logger.warn(`Application was updated, but old file deletion failed: ${fileId}`, error);
            }
        }
    }

    private validateApplicationData(applicationData: ApplicationDataDTO[], fields: Field[]) {
        this.validateRequiredApplicationData(applicationData, fields);
        this.validateExtraApplicationData(applicationData, fields);
    }

    private validateRequiredApplicationData(applicationData: ApplicationDataDTO[], fields: Field[]) {
        // all required fields are present
        for (const field of fields.filter(f => f.required)) {
            const applicationDataItem = applicationData.find(appData => appData.fieldId === field.fieldId);
            // if required file upload failed - do not throw exception, let the application be created and then edited later
            if (!this.isUploadField(field) && !applicationDataItem?.value?.trim()) {
                throw new BadRequestException(`Field ${field.code} is required!`);
            }
        }
    }

    private validateExtraApplicationData(applicationData: ApplicationDataDTO[], fields: Field[]) {
        // none extra fields are present
        const invalidData = applicationData.find(data => !fields.some(f => f.fieldId === data.fieldId));
        if (invalidData) {
            throw new BadRequestException(`Field not found: ${invalidData.fieldId}`);
        }
    }

    private async validateFiles(applicationDataFiles: ApplicationDataDTO[]) {
        for (const applicationDataFile of applicationDataFiles) {
            const file = await this.fileService.getByFileName(applicationDataFile.value);
            if (!file) {
                throw new BadRequestException(`File not found: ${applicationDataFile.value}`);
            }
            const filePath = `${process.env.UPLOAD_PATH}/${file.fileName}`;
            try {
                await fsPromises.access(filePath, fsPromises.constants.F_OK);
            } catch {
                throw new BadRequestException(`File does not exist at path: ${filePath}`);
            }
        }
    }

    private mergeApplicationData(
        existingApplicationData: ApplicationData[],
        updateApplicationData: ApplicationDataDTO[],
    ): ApplicationDataDTO[] {
        const applicationDataByFieldId = new Map<string, ApplicationDataDTO>(
            existingApplicationData.map(appData => [appData.fieldId, { fieldId: appData.fieldId, value: appData.value }]),
        );

        for (const updatedAppData of updateApplicationData) {
            applicationDataByFieldId.set(updatedAppData.fieldId, updatedAppData);
        }

        return Array.from(applicationDataByFieldId.values());
    }

    private async linkFilesToApplication(applicationDataFiles: ApplicationDataDTO[], applicationId: string) {
        for (const appDataFile of applicationDataFiles) {
            await this.fileService.saveApplicationId(appDataFile.value, applicationId);
        }
    }

    private async createApplicationWithData(
        userId: string,
        subNomination: Application['subNomination'],
        applicationData: ApplicationDataDTO[],
        fields: Field[],
    ): Promise<Application> {
        return this.dataSource.transaction(async manager => {
            const newApplication = manager.create(Application, {
                state: ApplicationState.New,
                subNomination,
                userId,
                applicationDate: new Date(),
                fullName: this.replacePlaceholders(subNomination.nomination.fullNameTemplate, applicationData, fields),
            });

            const savedApplication = await manager.save(Application, newApplication);
            const newApplicationData = applicationData.map(appData =>
                manager.create(ApplicationData, {
                    application: savedApplication,
                    fieldId: appData.fieldId,
                    value: appData.value,
                }),
            );

            await manager.save(ApplicationData, newApplicationData);
            return savedApplication;
        });
    }

    private isUploadField(field?: Field): boolean {
        return field?.type === FieldType.UploadImage || field?.type === FieldType.UploadMusic;
    }

    private replacePlaceholders(template: string, applicationData: ApplicationDataDTO[], fields: Field[]): string {
        try {
            const placeholderRegex = /{(\w+)}/g;

            const replacedTemplate = template.replace(placeholderRegex, (match, placeholder) => {
                const field = fields.find(f => f.code == placeholder);
                const data = applicationData.find(item => item.fieldId === field?.fieldId);
                return data ? data.value : match;
            });

            return replacedTemplate;
        } catch {
            return '';
        }
    }
}
