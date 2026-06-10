import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { Application } from '../entity/festival/application.entity';
import { ApplicationData } from '../entity/festival/application-data.entity';
import { ApplicationRepository } from '../repositories/application.repository';
import { ApplicationDataRepository } from '../repositories/application-data.repository';
import { SubNominationService } from './sub-nomination.service';
import { NominationService } from './nomination.service';
import { FileService } from './file.service';
import { RegisterApplicationDTO } from '../dto/register-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';
import { FieldType } from '../enums/fieldType';
import { ApplicationState } from '../entity/festival/application.entity';
import { Field } from '../entity/festival/field.entity';
import { ApplicationDataDTO } from '../dto/application-data.dto';
import { UserService } from './user.service';
import { withPublicApplicationState } from '../utils/application-public-state';
import { SubNomination } from '../entity/festival/sub-nomination.entity';

@Injectable()
export class ApplicationService {
    constructor(
        private readonly subNominationService: SubNominationService,
        private readonly nominationService: NominationService,
        private readonly applicationRepository: ApplicationRepository,
        private readonly applicationDataRepository: ApplicationDataRepository,
        private readonly fileService: FileService,
        private readonly userService: UserService,
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
        const subNomination = await this.subNominationService.getSubNominationById(application.subNominationId);
        if (!subNomination) {
            throw new BadRequestException(`No such subnomination: ${application.subNominationId}`);
        }

        if (!userId) {
            throw new BadRequestException('User is empty');
        }

        const fields = (await this.nominationService.getFields(subNomination.nomination.nominationId)).map(nomField => nomField.field);

        await this.validateApplicationData(application.applicationData, fields);

        const savedApplication = await this.createApplication(
            userId,
            subNomination,
            application.applicationData,
            fields,
            subNomination.nomination.fullNameTemplate,
        );

        for (const appData of application.applicationData) {
            await this.createApplicationData(savedApplication, appData);

            const field = fields.find(f => f.fieldId === appData.fieldId);

            if ((field?.type === FieldType.UploadImage || field?.type === FieldType.UploadMusic) && !!appData.value) {
                try {
                    await this.fileService.saveApplicationId(appData.value, savedApplication.applicationId);
                } catch (err) {
                    Logger.error(`Error saving file: ${err}`);
                }
            }
        }
    }

    async updateApplication(userId: string, updateApplicationDTO: UpdateApplicationDTO): Promise<void> {
        const application = await this.applicationRepository.get(updateApplicationDTO.applicationId);
        if (!application) {
            throw new BadRequestException(`Application not found: ${updateApplicationDTO.applicationId}`);
        }

        const user = await this.userService.findById(userId);
        if (user?.userId !== application.userId && !user?.isAdmin) {
            throw new BadRequestException(`Different userId`);
        }

        const subNomination = await this.subNominationService.getSubNominationById(
            updateApplicationDTO.subNominationId ?? application.subNominationId,
        );
        if (!subNomination) {
            throw new BadRequestException(
                `Subnomination not found: ${updateApplicationDTO.subNominationId ?? application.subNominationId}`,
            );
        }
        const fields = (await this.nominationService.getFields(subNomination.nomination.nominationId)).map(nomField => nomField.field);

        if (updateApplicationDTO.applicationData) {
            for (const updatedAppData of updateApplicationDTO.applicationData) {
                const field = fields.find(f => f.fieldId === updatedAppData.fieldId);
                if (!field) {
                    throw new BadRequestException(`Field not found: ${updatedAppData.fieldId}`);
                }

                const existingAppData = application.applicationData.find(appData => appData.fieldId === updatedAppData.fieldId);

                if (field.type === FieldType.UploadImage || field.type === FieldType.UploadMusic) {
                    const file = await this.fileService.getByFileName(updatedAppData.value);
                    if (file) {
                        const filePath = `${process.env.UPLOAD_PATH}/${file.fileName}`;
                        try {
                            await fsPromises.access(filePath, fsPromises.constants.F_OK);
                        } catch {
                            throw new BadRequestException(`File does not exist at path: ${filePath}`);
                        }

                        await this.fileService.saveApplicationId(updatedAppData.value, application.applicationId);
                    }
                }

                if (existingAppData) {
                    existingAppData.value = updatedAppData.value;
                    await this.applicationDataRepository.update(existingAppData);
                } else {
                    const newAppData = new ApplicationData();
                    newAppData.fieldId = field.fieldId;
                    newAppData.application = application;
                    newAppData.value = updatedAppData.value;
                    await this.applicationDataRepository.create(newAppData);
                }
            }
        }

        const dtos = application.applicationData.map(appData => {
            return { fieldId: appData.fieldId, value: appData.value };
        });

        application.fullName = this.replacePlaceholders(subNomination.nomination.fullNameTemplate, dtos, fields);
        application.subNomination = subNomination;
        application.state = ApplicationState.New;

        await this.applicationRepository.update(application);
    }

    async setApplicationState(applicationId: string, newState: ApplicationState, note?: string): Promise<void> {
        const application = await this.applicationRepository.get(applicationId);
        if (!application) {
            throw new BadRequestException(`Application not found: ${applicationId}`);
        }

        application.state = newState;
        application.adminNote = note && newState === ApplicationState.Invalid ? note : null;
        await this.applicationRepository.update(application);
    }

    async getApplicationDataWithFieldValues(fieldCodes: string[]): Promise<{ applicationId: string; value: string }[]> {
        return await this.applicationDataRepository.getApplicationsWithFieldValues(fieldCodes);
    }

    private async validateApplicationData(applicationData: ApplicationDataDTO[], fields: Field[]) {
        for (const field of fields) {
            const applicationDataItem = applicationData.find(appData => appData.fieldId === field.fieldId);
            if (!applicationDataItem) {
                throw new BadRequestException(`Missing field ${field.code}`);
            }

            if (field.type === FieldType.UploadImage || field.type === FieldType.UploadMusic) {
                const file = await this.fileService.getByFileName(applicationDataItem.value);
                if (!file) {
                    continue;
                }

                const filePath = `${process.env.UPLOAD_PATH}/${file.fileName}`;
                try {
                    await fsPromises.access(filePath, fsPromises.constants.F_OK);
                } catch {
                    throw new BadRequestException(`File does not exist at path: ${filePath}`);
                }
            }
        }
    }

    private async createApplication(
        userId: string,
        subNomination: SubNomination,
        applicationData: ApplicationDataDTO[],
        fields: Field[],
        fullNameTemplate: string,
    ) {
        const newApplication = new Application();
        newApplication.state = ApplicationState.New;
        newApplication.subNomination = subNomination;
        newApplication.userId = userId;
        newApplication.applicationDate = new Date();
        newApplication.fullName = this.replacePlaceholders(fullNameTemplate, applicationData, fields);

        return this.applicationRepository.create(newApplication);
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

    private async createApplicationData(savedApplication: Application, appData: ApplicationDataDTO) {
        const newAppData = new ApplicationData();
        newAppData.application = savedApplication;
        newAppData.fieldId = appData.fieldId;
        newAppData.value = appData.value;
        return this.applicationDataRepository.create(newAppData);
    }
}
