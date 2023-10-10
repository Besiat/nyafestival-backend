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
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './auth-strategies/jwt-strategy';



@Module({
  imports: [
    JwtModule.register({
      secret: `${process.env.TOKEN_SECRET}`,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfiguration, // Use your custom configuration class
    }),
    TypeOrmModule.forFeature([Page, Nomination, User])],
  controllers: [PagesController, NominationController, UserController],
  providers: [PageService, PageRepository, NominationService, NominationRepository, UserService, UserRepository, AuthService, JwtStrategy],
})
export class AppModule {

}
