/* global describe, it, expect */
import { DataSource } from 'typeorm';
import { LinkedApplicationService, normalizeParticipantName } from './linked-application.service';
import { ApplicationData } from '../entity/festival/application-data.entity';
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { FieldType } from '../enums/fieldType';
import { Application, ApplicationState } from '../entity/festival/application.entity';
import { getParticipantName } from '../utils/participant-name';
import { withPublicApplicationState } from '../utils/application-public-state';

describe('linked application validation', () => {
    it('normalizes and returns only the separate name parts', () => {
        expect(
            normalizeParticipantName({
                participantId: 'p',
                lastName: '  Иванова-Петрова ',
                firstName: 'Анна',
                middleName: '  Сергеевна  ',
            }),
        ).toEqual({
            lastName: 'Иванова-Петрова',
            firstName: 'Анна',
            middleName: 'Сергеевна',
        });
    });
    it('formats full names from their parts without storing a duplicate value', () => {
        expect(getParticipantName({ lastName: 'Иванова-Петрова', firstName: 'Анна', middleName: 'Сергеевна' })).toBe(
            'Иванова-Петрова Анна Сергеевна',
        );
        expect(getParticipantName({ lastName: null, firstName: null, middleName: null })).toBe('');
    });
    it.each(['lastName', 'firstName', 'middleName'])('requires %s and identifies the person and missing name part', key => {
        try {
            normalizeParticipantName({ participantId: 'p', lastName: 'Иванова', firstName: 'Анна', middleName: 'Сергеевна', [key]: ' ' });
            throw new Error('Expected validation failure');
        } catch (error) {
            expect(error.getResponse()).toEqual(expect.objectContaining({ participantId: 'p', fieldId: key }));
        }
    });
    it('merges partial answer updates without rewriting unchanged answers', async () => {
        const application = { applicationId: 'application', userId: 'owner', subNominationId: 'sub', state: ApplicationState.Accepted };
        const oldAnswers = [
            { applicationDataId: 'a', fieldId: 'character', value: 'Old character' },
            { applicationDataId: 'b', fieldId: 'confirmation', value: 'true' },
        ];
        const sub = {
            subNominationId: 'sub',
            nomination: {
                applicationMode: 'standalone',
                fullNameTemplate: '{char_name}',
                nominationFields: [
                    { field: { fieldId: 'character', code: 'char_name', type: FieldType.Text } },
                    { field: { fieldId: 'confirmation', code: 'confirm_age_18', type: FieldType.Checkbox } },
                ],
            },
        };
        const manager = {
            findOne: jest.fn(entity => entity === Application ? application : entity === SubNomination ? sub : null),
            findBy: jest.fn(entity => entity === ApplicationData ? oldAnswers : []),
            create: jest.fn((_entity, value) => value),
            save: jest.fn(async (_entity, value) => value),
        };
        const service = new LinkedApplicationService({ transaction: callback => callback(manager) } as unknown as DataSource);

        await expect(service.save('owner', {
            applicationId: 'application',
            applicationData: [{ fieldId: 'character', value: 'New character' }],
        })).resolves.toEqual({ applicationId: 'application' });

        expect(manager.save).toHaveBeenCalledWith(Application, expect.objectContaining({
            fullName: 'New character', state: ApplicationState.New,
        }));
        expect(manager.save.mock.calls.filter(([entity]) => entity === ApplicationData)).toEqual([
            [ApplicationData, expect.objectContaining({ applicationDataId: 'a', fieldId: 'character', value: 'New character' })],
        ]);
    });
    it('masks unpublished decisions and notes using the source nomination visibility', () => {
        const application = { state: ApplicationState.Accepted, adminNote: 'private' } as Application;
        expect(withPublicApplicationState(application, false)).toEqual({ state: ApplicationState.Pending, adminNote: null });
        expect(withPublicApplicationState(application, true).state).toBe(ApplicationState.Accepted);
    });
});
