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


@Module({
  imports: [TypeOrmModule.forRootAsync({
    useClass: DatabaseConfiguration, // Use your custom configuration class
  }),
  TypeOrmModule.forFeature([Page, Nomination])],
  controllers: [PagesController, NominationController],
  providers: [PageService, PageRepository, NominationService, NominationRepository],
})
export class AppModule {

}
