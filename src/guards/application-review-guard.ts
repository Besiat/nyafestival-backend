import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Application } from '../entity/festival/application.entity';
import { SubNomination } from '../entity/festival/sub-nomination.entity';
import { assertApplicationAccess, assertNominationAccess, getApplicationAccess } from '../utils/application-access';

@Injectable()
export class ApplicationReviewGuard implements CanActivate {
    constructor(private readonly dataSource: DataSource) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const access = getApplicationAccess(request.user, request.query?.scope);
        if (!access.foyer || !request.params?.applicationId) return true;

        const application = await this.dataSource.manager.findOneBy(Application, { applicationId: request.params.applicationId });
        if (!application) throw new ForbiddenException('Заявка недоступна');
        await assertApplicationAccess(this.dataSource.manager, access, application);

        if (request.method === 'PUT') {
            if (request.body?.participants !== undefined) throw new ForbiddenException('Связанные заявки недоступны');
            if (request.body?.subNominationId) {
                const sub = await this.dataSource.manager.findOne(SubNomination, {
                    where: { subNominationId: request.body.subNominationId },
                    relations: ['nomination', 'nomination.nominationType'],
                });
                assertNominationAccess(access, sub?.nomination);
            }
        }
        return true;
    }
}
