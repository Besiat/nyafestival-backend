import { BadRequestException, Injectable } from "@nestjs/common";
import { RegisterApplicationDTO } from "../dto/register-application.dto";
import { SubNominationService } from "./sub-nomination.service";
import { NominationService } from "./nomination.service";
import { FieldType } from "../enums/fieldType";
import { promises as fsPromises } from 'fs';
import { AcceptedState, Application } from "../entity/festival/application.entity";
import { ApplicationRepository } from "../repositories/application.repository";
import { ApplicationData } from "../entity/festival/application-data.entity";
import { ApplicationDataRepository } from "../repositories/application-data.repository";
import { FileService } from "./file.service";
import { ApplicationFile } from "../entity/website/application-file.entity";

@Injectable()
export class ApplicationService {
    constructor(
        private readonly subNominationService: SubNominationService,
        private readonly nominationService: NominationService,
        private readonly applicationRepository: ApplicationRepository,
        private readonly applicationDataRepository: ApplicationDataRepository,
        private readonly fileService: FileService,
    ) { }

    async registerApplication(userId: string, application: RegisterApplicationDTO) {
        const subNomination = await this.subNominationService.getSubNominationById(application.subNominationId);
        if (!subNomination) {
            throw new BadRequestException(`No such subnomination: ${application.subNominationId}`);
        }

        if (!userId) {
            throw new BadRequestException("User is empty");
        }

        const fields = await this.nominationService.getFields(subNomination.nomination.nominationId);

        this.validateApplicationData(application.applicationData, fields);

        const savedApplication = await this.createApplication(userId, subNomination);

        for (const appData of application.applicationData) {
            const field = fields.find(f => f.fieldId === appData.fieldId);

            await this.createApplicationData(savedApplication, appData, field);

            if (field.type === FieldType.UploadImage || field.type === FieldType.UploadMusic) {
                await this.fileService.saveApplicationId(appData.value, savedApplication.applicationId);
            }
        }
    }

    private async validateApplicationData(applicationData, fields) {
        for (const field of fields) {
            const applicationDataItem = applicationData.find(appData => appData.fieldId === field.fieldId);
            if (!applicationDataItem) {
                throw new BadRequestException(`Missing field ${field.code}`);
            }

            if (field.type === FieldType.UploadImage || field.type === FieldType.UploadMusic) {
                const file = await this.fileService.getById(applicationDataItem.value);
                if (!file) {
                    throw new BadRequestException("File does not exist");
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

    private async createApplication(userId, subNomination) {
        const newApplication = new Application();
        newApplication.verified = false;
        newApplication.accepted = AcceptedState.Uncertain;
        newApplication.subNomination = subNomination;
        newApplication.userId = userId;
        return this.applicationRepository.create(newApplication);
    }

    private async createApplicationData(savedApplication, appData, field) {
        const newAppData = new ApplicationData();
        newAppData.application = savedApplication;
        newAppData.fieldId = appData.fieldId;
        newAppData.value = appData.value;
        return this.applicationDataRepository.create(newAppData);
    }
}
