import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { DataSource } from 'typeorm';
import { Application } from '../entity/festival/application.entity';
import { getParticipantName } from '../utils/participant-name';
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
import { LinkedApplicationService } from './linked-application.service';
import { ApplicationParticipant } from '../entity/festival/application-participant.entity';
import { UserService } from './user.service';
import { withPublicApplicationState } from '../utils/application-public-state';
import { FieldService } from './field.service';
import { UpdateApplicationByAdminDTO } from '../dto/update-application-by-admin.dto';
import { ScheduleService } from './schedule.service';
import { ApplicationScheduleAssignmentDTO } from '../dto/application-schedule-assignment.dto';

export type ApplicationWithScheduleAssignments = Application & {
    scheduledItems: ApplicationScheduleAssignmentDTO[];
};

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
        private readonly scheduleService: ScheduleService,
        private readonly linkedApplicationService: LinkedApplicationService,
    ) {}

    async getApplications(): Promise<Application[]> {
        return this.applicationRepository.getAll();
    }

    async getByUserId(userId: string): Promise<ApplicationWithScheduleAssignments[]> {
        const applications = await this.applicationRepository.getByUserId(userId);
        const publicApplications = applications.map(application => {
            const parent = applications.find(item => item.applicationId === application.sourceParticipant?.applicationId);
            const visibility = (parent ?? application).subNomination?.nomination?.nominationType?.showAccepted;
            const presented = withPublicApplicationState(application, visibility);
            const parentState = parent ? withPublicApplicationState(parent).state : undefined;
            return {
                ...presented,
                participants: (application.participants ?? []).filter(p => !p.removedAt).sort((a, b) => a.order - b.order),
                parentApplicationId: application.sourceParticipant?.applicationId ?? null,
                parentFullName: parent?.fullName,
                eligible: application.sourceParticipantId
                    ? !application.withdrawnAt &&
                      !parent?.withdrawnAt &&
                      !application.sourceParticipant?.removedAt &&
                      application.subNomination?.nomination?.applicationMode === 'supplementary' &&
                      application.subNomination.nomination.allowedSourceNominationIds.includes(
                          parent?.subNomination?.nomination?.nominationId,
                      ) &&
                      presented.state === ApplicationState.Accepted &&
                      parentState === ApplicationState.Accepted
                    : undefined,
            };
        });
        const acceptedApplicationIds = publicApplications
            .filter(
                application =>
                    !application.sourceParticipantId && !application.withdrawnAt && application.state === ApplicationState.Accepted,
            )
            .map(application => application.applicationId);
        const assignmentsByApplicationId = await this.scheduleService.getApplicationScheduleAssignments(acceptedApplicationIds);

        return publicApplications.map(application => ({
            ...application,
            scheduledItems: assignmentsByApplicationId.get(application.applicationId) ?? [],
        }));
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

        if (subNomination.nomination.applicationMode === 'supplementary')
            throw new BadRequestException('Хиноде подаётся через основное дефиле');
        if (application.participants !== undefined || subNomination.nomination.minParticipants > 0) {
            return this.linkedApplicationService.save(userId, application);
        }

        const fields = await this.getNominationFields(subNomination);

        this.validateCheckboxApplicationData(application.applicationData, fields);
        const applicationData = application.applicationData.filter(data => data.value?.trim());
        const applicationDataFiles = this.getUploadApplicationData(applicationData, fields);

        this.validateApplicationData(applicationData, fields);
        await this.validateFiles(applicationDataFiles);

        const savedApplication = await this.createApplicationWithData(userId, subNomination, applicationData, fields);

        await this.linkFilesToApplication(applicationDataFiles, savedApplication.applicationId);
    }

    async updateApplicationByUser(userId: string, updateApplicationDTO: UpdateApplicationByUserDTO): Promise<void> {
        const application = await this.getApplicationOrThrow(updateApplicationDTO.applicationId);

        if (application.sourceParticipantId) throw new BadRequestException('Редактируйте анкету в составе основной заявки');
        if (updateApplicationDTO.participants !== undefined || application.subNomination.nomination.minParticipants > 0) {
            await this.linkedApplicationService.save(userId, updateApplicationDTO);
            return;
        }

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
            this.validateCheckboxApplicationData(updateApplicationData, fields);
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

        if (
            updateApplicationDTO.participants !== undefined ||
            (!application.sourceParticipantId && application.subNomination.nomination.minParticipants > 0)
        ) {
            await this.linkedApplicationService.save(userId, { ...updateApplicationDTO, applicationId }, true);
            return;
        }
        if (
            application.sourceParticipantId &&
            updateApplicationDTO.subNominationId &&
            updateApplicationDTO.subNominationId !== application.subNominationId
        )
            throw new BadRequestException('Перемещение связанной анкеты запрещено');

        const subNominationId = updateApplicationDTO.subNominationId ?? application.subNominationId;
        const subNomination = await this.getSubNominationOrThrow(subNominationId);

        // keep empty values to allow clear the field
        const updateApplicationData = updateApplicationDTO.applicationData;
        const nominationFields = await this.getNominationFields(subNomination);
        if (!application.sourceParticipantId && subNomination.nomination.applicationMode === 'supplementary')
            throw new BadRequestException('Нельзя переместить основную заявку во вспомогательный отбор');
        if (subNominationId !== application.subNominationId && application.subNomination.nomination.minParticipants > 0) {
            await this.linkedApplicationService.save(application.userId, { ...updateApplicationDTO, applicationId }, true);
            return;
        }

        const fileIdsToDelete: string[] = [];

        if (updateApplicationData) {
            const fields = await this.fieldService.getAllFields();
            this.validateCheckboxApplicationData(updateApplicationData, fields);
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
                application.sourceParticipant
                    ? [getParticipantName(application.sourceParticipant)]
                    : (application.participants ?? [])
                          .filter(p => !p.removedAt)
                          .sort((a, b) => a.order - b.order)
                          .map(getParticipantName),
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
        if (newState === ApplicationState.Invalid && note !== undefined) {
            application.adminNote = note;
        }
        await this.applicationRepository.update(application);
    }

    async getParticipantNames(): Promise<{ applicationId: string; value: string }[]> {
        const participants = await this.dataSource
            .getRepository(ApplicationParticipant)
            .createQueryBuilder('participant')
            .innerJoin('participant.application', 'application')
            .where('application.state = :state', { state: ApplicationState.Accepted })
            .andWhere('application."sourceParticipantId" IS NULL AND application."withdrawnAt" IS NULL AND participant."removedAt" IS NULL')
            .orderBy('participant.order', 'ASC')
            .getMany();
        const groups = new Map<string, string[]>();
        participants.forEach(p => groups.set(p.applicationId, [...(groups.get(p.applicationId) ?? []), getParticipantName(p)]));
        return [...groups].map(([applicationId, names]) => ({ applicationId, value: names.filter(Boolean).join(', ') }));
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
            const value = applicationDataItem?.value;
            if (!this.isUploadField(field) && (field.type === FieldType.Checkbox ? value !== 'true' : !value?.trim())) {
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

    private validateCheckboxApplicationData(applicationData: ApplicationDataDTO[], fields: Field[]) {
        for (const data of applicationData) {
            const field = fields.find(f => f.fieldId === data.fieldId);
            if (field?.type !== FieldType.Checkbox) {
                continue;
            }
            if (data.value !== 'true' && data.value !== 'false') {
                throw new BadRequestException(`Field ${field.code} must be true or false!`);
            }
            if (field.required && data.value !== 'true') {
                throw new BadRequestException(`Field ${field.code} must be confirmed!`);
            }
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

    private replacePlaceholders(template: string, applicationData: ApplicationDataDTO[], fields: Field[], names: string[] = []): string {
        try {
            const placeholderRegex = /{(\w+)}/g;

            const replacedTemplate = template.replace(placeholderRegex, (match, placeholder) => {
                if (['participants', 'FIO', 'fio_group'].includes(placeholder)) return names.filter(Boolean).join(', ');
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
