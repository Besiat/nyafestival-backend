/* global describe, it, expect */
import { normalizeParticipantName, validateLinkedAnswers } from './linked-application.service';
import { Field } from '../entity/festival/field.entity';
import { FieldType } from '../enums/fieldType';
import { Application, ApplicationState } from '../entity/festival/application.entity';
import { getParticipantName } from '../utils/participant-name';
import { withPublicApplicationState } from '../utils/application-public-state';

const field = { fieldId: 'confirmation', label: '18 лет', code: 'confirm_age_18', required: true, type: FieldType.Checkbox } as Field;

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
    it.each(['false', ''])('does not accept %p as a required confirmation', value => {
        expect(() => validateLinkedAnswers([{ fieldId: field.fieldId, value }], [field], 'person')).toThrow();
    });
    it('identifies the participant and field in a missing-confirmation error', () => {
        try {
            validateLinkedAnswers([], [field], 'person');
            throw new Error('Expected validation failure');
        } catch (error) {
            expect(error.getResponse()).toEqual(expect.objectContaining({ participantId: 'person', fieldId: field.fieldId }));
        }
    });
    it('accepts false for optional checkboxes and true for required ones', () => {
        expect(validateLinkedAnswers([{ fieldId: field.fieldId, value: 'false' }], [{ ...field, required: false }])).toHaveLength(1);
        expect(validateLinkedAnswers([{ fieldId: field.fieldId, value: 'true' }], [field])).toHaveLength(1);
    });
    it('trims text answers and requires configured text fields', () => {
        const textField = { ...field, type: FieldType.Text, label: 'Персонаж' };
        expect(validateLinkedAnswers([{ fieldId: field.fieldId, value: '  Персонаж  ' }], [textField])).toEqual([
            { fieldId: field.fieldId, value: 'Персонаж' },
        ]);
        expect(() => validateLinkedAnswers([{ fieldId: field.fieldId, value: '  ' }], [textField])).toThrow('Заполните поле «Персонаж»');
    });
    it('masks unpublished decisions and notes using the source nomination visibility', () => {
        const application = { state: ApplicationState.Accepted, adminNote: 'private' } as Application;
        expect(withPublicApplicationState(application, false)).toEqual({ state: ApplicationState.Pending, adminNote: null });
        expect(withPublicApplicationState(application, true).state).toBe(ApplicationState.Accepted);
    });
});
