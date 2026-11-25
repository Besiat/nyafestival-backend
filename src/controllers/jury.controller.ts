import { Body, Controller, Get, Headers, Header, Post, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { IsNull, In, Repository } from 'typeorm';
import { Application, ApplicationState } from '../entity/festival/application.entity';

const materialFields: Record<string, string[]> = {
    'stage-cosplay': ['char_pic'],
    covervocal: ['orignal_song_link', 'original_song_link'],
    coverdance: ['original_dance_link'],
};

@Controller('api/jury')
export class JuryController {
    constructor(
        @InjectRepository(Application) private readonly applications: Repository<Application>,
        private readonly jwt: JwtService,
    ) {}

    private getSecret(): string {
        const password = process.env.JURY_PASSWORD;
        const secret = process.env.TOKEN_SECRET;
        if (!password || !secret) throw new ServiceUnavailableException('Jury access is not configured');
        return createHmac('sha256', secret).update('jury:' + password).digest('hex');
    }

    @Post('login')
    @Header('Cache-Control', 'no-store')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async login(@Body('password') password: unknown) {
        const secret = this.getSecret();
        if (typeof password !== 'string' || password.length > 512 ||
            !timingSafeEqual(createHash('sha256').update(password).digest(),
                createHash('sha256').update(process.env.JURY_PASSWORD!).digest())) {
            throw new UnauthorizedException();
        }
        return { token: await this.jwt.signAsync({ scope: 'jury' }, { secret, expiresIn: '12h' }) };
    }

    @Get('applications')
    @Header('Cache-Control', 'no-store')
    async list(@Headers('authorization') authorization?: string) {
        const secret = this.getSecret();
        try {
            if (!authorization?.startsWith('Bearer ')) throw new Error();
            const payload = await this.jwt.verifyAsync(authorization.slice(7), { secret });
            if (payload.scope !== 'jury') throw new Error();
        } catch {
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
