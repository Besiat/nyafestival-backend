import { Injectable, BadRequestException } from "@nestjs/common";
import { promises as fsPromises } from "fs";
import { Application } from "../entity/festival/application.entity";
import { ApplicationData } from "../entity/festival/application-data.entity";
import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationDataRepository } from "../repositories/application-data.repository";
import { SubNominationService } from "./sub-nomination.service";
import { NominationService } from "./nomination.service";
import { FileService } from "./file.service";
import { RegisterApplicationDTO } from "../dto/register-application.dto";
import { UpdateApplicationDTO } from "../dto/update-application.dto";
import { FieldType } from "../enums/fieldType";
import { ApplicationState } from "../entity/festival/application.entity";
import { Field } from "../entity/festival/field.entity";
import { ApplicationDataDTO } from "../dto/application-data.dto";

@Injectable()
export class ApplicationService {
    constructor(
        private readonly subNominationService: SubNominationService,
        private readonly nominationService: NominationService,
        private readonly applicationRepository: ApplicationRepository,
        private readonly applicationDataRepository: ApplicationDataRepository,
        private readonly fileService: FileService,
    ) { }

    async getApplications(): Promise<Application[]> {
        return this.applicationRepository.getAll();
    }

    async getByUserId(userId: string): Promise<Application[]> {
        return this.applicationRepository.getByUserId(userId);
    }

    async registerApplication(userId: string, application: RegisterApplicationDTO) {
        const subNomination = await this.subNominationService.getSubNominationById(application.subNominationId);
        if (!subNomination) {
            throw new BadRequestException(`No such subnomination: ${application.subNominationId}`);
        }

        if (!userId) {
            throw new BadRequestException("User is empty");
        }

        const fields = (await this.nominationService.getFields(subNomination.nomination.nominationId)).map(nomField => nomField.field);;

        await this.validateApplicationData(application.applicationData, fields);

        const savedApplication = await this.createApplication(userId, subNomination, application.applicationData, fields, subNomination.nomination.fullNameTemplate);

        for (const appData of application.applicationData) {
            const field = fields.find(f => f.fieldId === appData.fieldId);

            await this.createApplicationData(savedApplication, appData, field);

            if ((field.type === FieldType.UploadImage || field.type === FieldType.UploadMusic) && !!appData.value) {
                await this.fileService.saveApplicationId(appData.value, savedApplication.applicationId);
            }
        }
    }

    async updateApplication(userId: string, updateApplicationDTO: UpdateApplicationDTO): Promise<void> {
        const application = await this.applicationRepository.get(updateApplicationDTO.applicationId);
        if (!application) {
            throw new BadRequestException(`Application not found: ${updateApplicationDTO.applicationId}`);
        }

        if (userId !== application.userId) {
            throw new BadRequestException(`Different userId`);
        }

        const subNomination = await this.subNominationService.getSubNominationById(updateApplicationDTO.subNominationId);
        const fields = (await this.nominationService.getFields(subNomination.nomination.nominationId)).map(nomField => nomField.field);

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
                    } catch (err) {
                        throw new BadRequestException(`File does not exist at path: ${filePath}`);
                    }

                    await this.fileService.saveApplicationId(updatedAppData.value, application.applicationId);
                }
            }

            if (existingAppData) {
                existingAppData.value = updatedAppData.value;
                this.applicationDataRepository.update(existingAppData);
            }
            else {
                const newAppData = new ApplicationData();
                newAppData.fieldId=field.fieldId;
                newAppData.application = application;
                newAppData.value = updatedAppData.value;
                await this.applicationDataRepository.create(newAppData);
            }
        }

        const dtos = application.applicationData.map(appData => { return { fieldId: appData.fieldId, value: appData.value } });

        application.fullName = this.replacePlaceholders(subNomination.nomination.fullNameTemplate, dtos, fields);
        application.subNomination = subNomination;
        // Save the updated application
        await this.applicationRepository.update(application);
    }

    async setPendingState(applicationId: string): Promise<void> {
        const application = await this.applicationRepository.get(applicationId);
        application.state = ApplicationState.Pending;
        await this.applicationRepository.update(application);
    }

    async setInvalidState(applicationId: string, note: string): Promise<void> {
        const application = await this.applicationRepository.get(applicationId);
        application.state = ApplicationState.Invalid;
        application.adminNote = note;
        await this.applicationRepository.update(application);
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
                } catch (err) {
                    throw new BadRequestException(`File does not exist at path: ${filePath}`);
                }
            }
        }
    }

    private async createApplication(
        userId: string,
        subNomination,
        applicationData: ApplicationDataDTO[],
        fields: Field[],
        fullNameTemplate: string
    ) {
        const newApplication = new Application();
        newApplication.state = ApplicationState.New;
        newApplication.subNomination = subNomination;
        newApplication.userId = userId;

        // Implement logic to replace placeholders in fullNameTemplate
        newApplication.fullName = this.replacePlaceholders(fullNameTemplate, applicationData, fields);

        return this.applicationRepository.create(newApplication);
    }

    private replacePlaceholders(template: string, applicationData: ApplicationDataDTO[], fields: Field[]): string {
        // Regular expression to match placeholders like {VAR}
        const placeholderRegex = /{(\w+)}/g;

        // Replace placeholders in the template
        const replacedTemplate = template.replace(placeholderRegex, (match, placeholder) => {
            const field = fields.find(f => f.code == placeholder);
            const data = applicationData.find((item) => item.fieldId === field.fieldId);
            return data ? data.value : match; // Replace with data.value or keep the original placeholder
        });

        return replacedTemplate;
    }

    private async createApplicationData(savedApplication, appData, field) {
        const newAppData = new ApplicationData();
        newAppData.application = savedApplication;
        newAppData.fieldId = appData.fieldId;
        newAppData.value = appData.value;
        return this.applicationDataRepository.create(newAppData);
    }
}
