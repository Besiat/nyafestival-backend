import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PagesController } from './controllers/page.controller';
import { PageService } from './services/page.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entity/website/page.entity';
import { DatabaseConfiguration } from './config/database.config';
import { PageRepository } from './repositories/page.repository';
import { NominationController } from './controllers/nomination.controller';
import { NominationService } from './services/nomination.service';
import { NominationRepository } from './repositories/nomination.repository';
import { Nomination } from './entity/festival/nomination.entity';
import { User } from './entity/website/user';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { UserRepository } from './repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth-strategies/jwt-strategy';
import { EmailService } from './services/email.service';
import { FieldRepository } from './repositories/field.repository';
import { FieldService } from './services/field.service';
import { SubNominationRepository } from './repositories/sub-nomination.repository';
import { SubNominationService } from './services/sub-nomination.service';
import { SubNomination } from './entity/festival/sub-nomination.entity';
import { Field } from './entity/festival/field.entity';
import { FieldsController } from './controllers/field.controller';
import { SubNominationController } from './controllers/sub-nomination.controller';
import { MulterModule } from '@nestjs/platform-express';
import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';
import { ApplicationFile } from './entity/website/application-file.entity';
import multer = require('multer');
import dotenv = require('dotenv');
import ShortUniqueId from 'short-unique-id';
import { ApplicationService } from './services/application.service';
import { ApplicationRepository } from './repositories/application.repository';
import { ApplicationDataRepository } from './repositories/application-data.repository';
import { ApplicationController } from './controllers/application.controller';
import { Application } from './entity/festival/application.entity';
import { ApplicationData } from './entity/festival/application-data.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { NominationField } from './entity/festival/nomination-fields.entity';
import { Config } from './entity/website/config.entity';
import { ConfigService } from './services/config.service';
import { ConfigController } from './controllers/config.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { Block } from './entity/festival/block.entity';
import { ScheduleItem } from './entity/festival/schedule-item.entity';
import { ScheduleService } from './services/schedule.service';
import { VotingService } from './services/voting.service';
import { VotingController } from './controllers/voting.controller';
import { Vote } from './entity/festival/vote.entity';
import { StageVote } from './entity/festival/stage-vote.entity';
import { Ticket } from './entity/festival/ticket.entity';
import { UserQuestProgress } from './entity/festival/user-quest.entity';
import { TicketsController } from './controllers/tickets.controller';
import { TicketService } from './services/ticket.service';
import { TicketRepository } from './repositories/ticket.repository';
import { QuestController } from './controllers/quest.controller';
import { QuestRepository } from './repositories/quest.repository';
import { QuestService } from './services/quest.service';
import { Quest2024 } from './constants/quest-2024';
import { IQuest } from './interfaces/i-quest';

dotenv.config();

@Module({
    imports: [
        MulterModule.register({
            storage: multer.diskStorage({
                destination: `${process.env.UPLOAD_PATH}`,
                filename: function (req, file, cb) {
                    const fileExt = file.originalname.split('.').pop();
                    const uid = new ShortUniqueId({ length: 10 }).rnd();
                    cb(null, `${uid}.${fileExt}`);
                }
            })
        }),
        JwtModule.register({
            secret: `${process.env.TOKEN_SECRET}`,
            signOptions: { expiresIn: '30d' },
        }),
        TypeOrmModule.forRootAsync({
            useClass: DatabaseConfiguration
        }),
        TypeOrmModule.forFeature([Page, Nomination, User, SubNomination, Field, ApplicationFile, Application, ApplicationData, NominationField, Config, Block, ScheduleItem, Vote, StageVote, Ticket, UserQuestProgress]),
        ThrottlerModule.forRoot([{
            ttl: 1000,
            limit: 50,
        }]),
    ],
    controllers: [
        PagesController,
        NominationController,
        UserController,
        FieldsController,
        SubNominationController,
        FileController,
        ApplicationController,
        ConfigController,
        ScheduleController,
        VotingController,
        TicketsController,
        QuestController
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        },
        PageService,
        PageRepository,
        NominationService,
        NominationRepository,
        UserService,
        UserRepository,
        AuthService,
        JwtStrategy,
        EmailService,
        FieldRepository,
        FieldService,
        SubNominationRepository,
        SubNominationService,
        FileService,
        ApplicationService,
        ApplicationRepository,
        ApplicationDataRepository,
        ConfigService,
        ScheduleService,
        VotingService,
        TicketRepository,
        TicketService,
        QuestRepository,
        QuestService,
        {
            provide: 'IQuest',
            useClass: Quest2024,
        },],
})
export class AppModule {

}
