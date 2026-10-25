import { ForbiddenException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../entity/website/user';
import { Application } from '../entity/festival/application.entity';
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { Nomination } from '../entity/festival/nomination.entity';

export const FOYER_TYPE_CODES = ['fair', 'authors', 'media', 'lecture-hall'] as const;

export type ApplicationAccess = { userId: string; foyer: boolean };

export const getApplicationAccess = (user: User, scope?: unknown): ApplicationAccess => {
    if (user?.isAdmin !== true && user?.isFoyerCoordinator !== true) throw new ForbiddenException();
    return { userId: user.userId, foyer: user.isAdmin !== true || scope === 'foyer' };
};

export const assertNominationAccess = (access: ApplicationAccess, nomination?: Nomination) => {
    if (access.foyer && !FOYER_TYPE_CODES.some(code => code === nomination?.nominationType?.code)) {
        throw new ForbiddenException('Заявка вне доступной области');
    }
};

export const assertApplicationAccess = async (manager: EntityManager, access: ApplicationAccess, application: Application) => {
    const sub = await manager.findOne(SubNomination, {
        where: { subNominationId: application.subNominationId },
        relations: ['nomination', 'nomination.nominationType'],
    });
    assertNominationAccess(access, sub?.nomination);
};
