import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { DataSource, EntityManager, In } from 'typeorm';
import { Application, ApplicationState } from '../entity/festival/application.entity';
import { ApplicationData } from '../entity/festival/application-data.entity';
import { ApplicationParticipant } from '../entity/festival/application-participant.entity';
import { ApplicationFile } from '../entity/website/application-file.entity';
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { Field } from '../entity/festival/field.entity';
import { ApplicationDataDTO } from '../dto/application-data.dto';
import { ApplicationParticipantDTO } from '../dto/application-participant.dto';
import { getParticipantName } from '../utils/participant-name';

export interface LinkedApplicationRequest {
    applicationId?: string;
    subNominationId?: string;
    participants?: ApplicationParticipantDTO[];
    applicationData?: ApplicationDataDTO[];
    fullName?: string;
    recalculateFullName?: boolean;
}

export const normalizeParticipantName = (participant: ApplicationParticipantDTO) => {
    const result = { lastName: '', firstName: '', middleName: '' };
    for (const [key, label] of Object.entries({ lastName: 'Фамилия', firstName: 'Имя', middleName: 'Отчество' })) {
        const value = participant[key];
        if (!value.trim())
            throw new BadRequestException({ message: `Заполните поле «${label}»`, participantId: participant.participantId, fieldId: key });
        result[key] = value.trim().replace(/\s+/g, ' ');
    }
    return result;
};

const participantIdentityChanged = (old: ApplicationParticipant, next: ApplicationParticipantDTO) =>
    !old || !!old.removedAt || ['lastName', 'firstName', 'middleName'].some(key => (old[key] ?? '') !== (next[key] ?? ''));

const mergeAnswers = (existing: ApplicationDataDTO[], updates: ApplicationDataDTO[] = []) => {
    const map = new Map(existing.map(answer => [answer.fieldId, { fieldId: answer.fieldId, value: answer.value }]));
    updates.forEach(answer => map.set(answer.fieldId, answer));
    return [...map.values()];
};

const answersChanged = (old: ApplicationDataDTO[], next: ApplicationDataDTO[]) => {
    const values = new Map(old.map(answer => [answer.fieldId, answer.value]));
    return next.some(answer => values.get(answer.fieldId) !== answer.value) || old.length !== next.length;
};

@Injectable()
export class LinkedApplicationService {
    constructor(private readonly dataSource: DataSource) {}

    async save(userId: string, request: LinkedApplicationRequest, admin = false): Promise<{ applicationId: string }> {
        return this.dataSource.transaction(async manager => {
            let application: Application | null = null;
            if (request.applicationId) {
                application = await manager.findOne(Application, {
                    where: { applicationId: request.applicationId },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!application || (!admin && application.userId !== userId) || application.sourceParticipantId)
                    throw new BadRequestException('Основная заявка недоступна');
            }
            const subNomination = await this.getSubNomination(manager, request.subNominationId ?? application?.subNominationId);
            const nomination = subNomination.nomination;
            if (nomination.applicationMode !== 'standalone')
                throw new BadRequestException('Эта анкета подаётся только вместе с основным дефиле');
            const fields = nomination.nominationFields.map(link => link.field);
            const oldAnswers = application ? await manager.findBy(ApplicationData, { applicationId: application.applicationId }) : [];
            const answers = mergeAnswers(oldAnswers, request.applicationData);
            const oldParticipants = application
                ? await manager.findBy(ApplicationParticipant, { applicationId: application.applicationId })
                : [];
            const participants: ApplicationParticipantDTO[] =
                request.participants?.map(participant => ({ ...participant, ...normalizeParticipantName(participant) })) ??
                oldParticipants
                    .filter(p => !p.removedAt)
                    .sort((a, b) => a.order - b.order)
                    .map(p => ({
                        participantId: p.participantId,
                        lastName: p.lastName,
                        firstName: p.firstName,
                        middleName: p.middleName,
                    }));
            const ids = new Set(participants.map(participant => participant.participantId));
            const mainChanged =
                !application || answersChanged(oldAnswers, answers) || application.subNominationId !== subNomination.subNominationId;
            const candidateMaterialChanged =
                !!application &&
                (application.subNominationId !== subNomination.subNominationId ||
                    fields.some(
                        field =>
                            ['costume', 'char_pic', 'char_name', 'fandom'].includes(field.code) &&
                            oldAnswers.find(answer => answer.fieldId === field.fieldId)?.value !==
                                answers.find(answer => answer.fieldId === field.fieldId)?.value,
                    ));
            const existingId = application?.applicationId;
            application =
                application ??
                manager.create(Application, {
                    applicationId: randomUUID(),
                    userId,
                    applicationDate: new Date(),
                    state: ApplicationState.New,
                });
            if (mainChanged && !admin) {
                application.state = ApplicationState.New;
                application.adminNote = null;
            }
            application.subNominationId = subNomination.subNominationId;
            if (admin && request.fullName !== undefined) application.fullName = request.fullName;
            else if (!existingId || mainChanged || request.recalculateFullName)
                application.fullName = this.fullName(subNomination, answers, participants.map(getParticipantName));
            await manager.save(Application, application);
            await this.saveAnswers(manager, application.applicationId, answers, fields, admin ? userId : application.userId);

            // An omitted participant list is a partial update, never a withdrawal.
            const children = oldParticipants.length
                ? await manager.findBy(Application, { sourceParticipantId: In(oldParticipants.map(p => p.participantId)) })
                : [];
            for (const old of oldParticipants.filter(p => !p.removedAt && !ids.has(p.participantId))) {
                old.removedAt = new Date();
                await manager.save(ApplicationParticipant, old);
                for (const child of children.filter(c => c.sourceParticipantId === old.participantId && !c.withdrawnAt)) {
                    child.withdrawnAt = new Date();
                    await manager.save(Application, child);
                }
            }
            for (const [index, input] of participants.entries()) {
                const old = oldParticipants.find(p => p.participantId === input.participantId);
                const identityChanged = !!old && participantIdentityChanged(old, input);
                const participant = manager.create(ApplicationParticipant, {
                    participantId: input.participantId,
                    applicationId: application.applicationId,
                    lastName: input.lastName,
                    firstName: input.firstName,
                    middleName: input.middleName,
                    order: index,
                    removedAt: null,
                });
                await manager.save(ApplicationParticipant, participant);
                const touched = new Set<string>();
                for (const childInput of input.supplementaryApplications ?? []) {
                    touched.add(childInput.subNominationId);
                    const childSub = await this.getSubNomination(manager, childInput.subNominationId);
                    const child = children.find(
                        c => c.sourceParticipantId === participant.participantId && c.subNominationId === childInput.subNominationId,
                    );
                    if (childInput.applicationId && childInput.applicationId !== child?.applicationId)
                        throw new BadRequestException({
                            message: 'Анкета не принадлежит этому участнику',
                            participantId: participant.participantId,
                        });
                    if (!childInput.active) {
                        if (child && !child.withdrawnAt) {
                            child.withdrawnAt = new Date();
                            await manager.save(Application, child);
                        }
                        continue;
                    }
                    const childFields = childSub.nomination.nominationFields.map(link => link.field);
                    const oldData = child ? await manager.findBy(ApplicationData, { applicationId: child.applicationId }) : [];
                    const childData = mergeAnswers(oldData, childInput.applicationData);

                    const changed =
                        !child || !!child.withdrawnAt || identityChanged || candidateMaterialChanged || answersChanged(oldData, childData);

                    const target =
                        child ??
                        manager.create(Application, {
                            applicationId: randomUUID(),
                            userId: application.userId,
                            subNominationId: childSub.subNominationId,
                            sourceParticipantId: participant.participantId,
                            applicationDate: new Date(),
                        });
                    if (changed) {
                        target.state = ApplicationState.New;
                        target.adminNote = null;
                    }
                    target.withdrawnAt = null;
                    target.fullName = this.fullName(childSub, childData, [getParticipantName(participant)]);
                    await manager.save(Application, target);
                    await this.saveAnswers(manager, target.applicationId, childData, childFields, application.userId);
                }
                // Check omitted children too when the main nomination or participant changes.
                for (const child of children.filter(
                    c => c.sourceParticipantId === participant.participantId && !c.withdrawnAt && !touched.has(c.subNominationId),
                )) {
                    const childSub = await this.getSubNomination(manager, child.subNominationId);
                    if (identityChanged || candidateMaterialChanged) {
                        child.state = ApplicationState.New;
                        child.adminNote = null;
                        child.fullName = this.fullName(
                            childSub,
                            await manager.findBy(ApplicationData, { applicationId: child.applicationId }),
                            [getParticipantName(participant)],
                        );
                        await manager.save(Application, child);
                    }
                }
            }
            return { applicationId: application.applicationId };
        });
    }

    private async getSubNomination(manager: EntityManager, id?: string): Promise<SubNomination> {
        const sub = await manager.findOne(SubNomination, {
            where: { subNominationId: id },
            relations: ['nomination', 'nomination.nominationType', 'nomination.nominationFields', 'nomination.nominationFields.field'],
        });
        if (!sub) throw new BadRequestException('Подноминация не найдена');
        return sub;
    }

    private fullName(sub: SubNomination, answers: ApplicationDataDTO[], names: string[]): string {
        const fields = sub.nomination.nominationFields.map(link => link.field);
        return sub.nomination.fullNameTemplate.replace(/{([\w-]+)}/g, (match, code) => {
            if (code === 'FIO' || code === 'fio_group' || code === 'participants') return names.filter(Boolean).join(', ');
            const field = fields.find(f => f.code === code);
            return answers.find(a => a.fieldId === field?.fieldId)?.value ?? match;
        });
    }

    private async saveAnswers(
        manager: EntityManager,
        applicationId: string,
        answers: ApplicationDataDTO[],
        fields: Field[],
        userId: string,
    ) {
        const existing = await manager.findBy(ApplicationData, { applicationId });
        for (const answer of answers) {
            const old = existing.find(item => item.fieldId === answer.fieldId);
            if (old?.value === answer.value) continue;
            const field = fields.find(f => f.fieldId === answer.fieldId);
            if (field?.type.startsWith('upload-') && answer.value) {
                const file = await manager.findOneBy(ApplicationFile, { fileName: answer.value, userId });
                if (!file || (file.applicationId && file.applicationId !== applicationId))
                    throw new BadRequestException({ message: `Файл поля «${field.label}» недоступен`, fieldId: field.fieldId });
                try {
                    await fs.access(`${process.env.UPLOAD_PATH}/${file.fileName}`);
                } catch {
                    throw new BadRequestException({ message: `Файл поля «${field.label}» не найден`, fieldId: field.fieldId });
                }
                file.applicationId = applicationId;
                await manager.save(ApplicationFile, file);
            }
            await manager.save(
                ApplicationData,
                manager.create(ApplicationData, { ...(old ?? {}), applicationId, fieldId: answer.fieldId, value: answer.value }),
            );
        }
    }
}
