import { ApplicationParticipant } from '../entity/festival/application-participant.entity';

export const getParticipantName = (
    participant: Pick<ApplicationParticipant, 'lastName' | 'firstName' | 'middleName'> & { legacyFio?: string | null },
): string => [participant.lastName, participant.firstName, participant.middleName].filter(Boolean).join(' ') || participant.legacyFio || '';
