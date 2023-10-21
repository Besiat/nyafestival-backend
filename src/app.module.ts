import { Module } from '@nestjs/common';
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

dotenv.config()

@Module({
  imports: [
    MulterModule.register({
      storage: multer.diskStorage({
        destination: `${process.env.UPLOAD_PATH}`,
        filename: function (req, file, cb) {
          var fileExt = file.originalname.split('.').pop();
          const uid = new ShortUniqueId({ length: 10 }).rnd();
          cb(null, `${uid}.${fileExt}`);
        }
      })
    }),
    JwtModule.register({
      secret: `${process.env.TOKEN_SECRET}`,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfiguration
    }),
    TypeOrmModule.forFeature([Page, Nomination, User, SubNomination, Field, ApplicationFile, Application, ApplicationData])],
  controllers: [
    PagesController,
    NominationController,
    UserController,
    FieldsController,
    SubNominationController,
    FileController,
    ApplicationController
  ],
  providers: [
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
    ApplicationDataRepository],
})
export class AppModule {

}
