import { ApplicationParticipant } from '../entity/festival/application-participant.entity';

export const getParticipantName = (participant: Pick<ApplicationParticipant, 'lastName' | 'firstName' | 'middleName'>): string =>
    [participant.lastName, participant.firstName, participant.middleName].filter(Boolean).join(' ');
