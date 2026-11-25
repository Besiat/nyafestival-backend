import { Body, Controller, Get, Headers, Header, Post, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { IsNull, In, Repository } from 'typeorm';
import { Application, ApplicationState } from '../entity/festival/application.entity';

const materialFields: Record<string, string[]> = {
    'stage-cosplay': ['char_pic'],
    covervocal: ['orignal_song_link', 'original_song_link'],
    coverdance: ['original_dance_link'],
};
const jurySessionDuration = 12 * 60 * 60 * 1000;

@Controller('api/jury')
export class JuryController {
    private readonly sessions = new Map<string, number>();

    constructor(
        @InjectRepository(Application) private readonly applications: Repository<Application>,
    ) {}

    private getPassword(): string {
        const password = process.env.JURY_PASSWORD;
        if (!password) throw new ServiceUnavailableException('Jury access is not configured');
        return password;
    }

    @Post('login')
    @Header('Cache-Control', 'no-store')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    login(@Body('password') password: unknown) {
        const configuredPassword = this.getPassword();
        if (typeof password !== 'string' || password.length > 512 ||
            !timingSafeEqual(createHash('sha256').update(password).digest(),
                createHash('sha256').update(configuredPassword).digest())) {
            throw new UnauthorizedException();
        }

        const now = Date.now();
        for (const [token, expiresAt] of this.sessions) {
            if (expiresAt <= now) this.sessions.delete(token);
        }
        const token = randomBytes(32).toString('base64url');
        this.sessions.set(token, now + jurySessionDuration);
        return { token };
    }

    @Get('applications')
    @Header('Cache-Control', 'no-store')
    async list(@Headers('authorization') authorization?: string) {
        this.getPassword();
        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
        const expiresAt = this.sessions.get(token);
        if (expiresAt === undefined || expiresAt <= Date.now()) {
            this.sessions.delete(token);
            throw new UnauthorizedException();
        }
        const applications = await this.applications.find({
            where: {
                state: ApplicationState.Accepted,
                withdrawnAt: IsNull(),
                subNomination: { nomination: { nominationType: { code: In(Object.keys(materialFields)) } } },
            },
            relations: { subNomination: { nomination: { nominationType: true } }, applicationData: { field: true } },
            order: { subNomination: { nomination: { order: 'ASC' }, order: 'ASC' }, fullName: 'ASC' },
        });
        return applications.map(application => {
            const sub = application.subNomination;
            const nomination = sub.nomination;
            const type = nomination.nominationType.code;
            return {
                id: application.applicationId,
                title: application.fullName,
                type,
                nomination: { id: nomination.nominationId, name: nomination.name },
                subNomination: { id: sub.subNominationId, name: sub.name },
                materials: application.applicationData
                    .filter(data => materialFields[type]?.includes(data.field?.code) && data.value?.trim())
                    .map(data => ({ value: data.value.trim(), kind: data.field.type })),
            };
        });
    }
}
