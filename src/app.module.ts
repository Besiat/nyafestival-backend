import { Module } from '@nestjs/common';
import { PagesController } from './controllers/page.controller';
import { PageService } from './services/page.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entity/website/page.entity';
import { DatabaseConfiguration } from './config/database.config';
import { PageRepository } from './repositories/page.repository';


@Module({
  imports: [TypeOrmModule.forRootAsync({
    useClass: DatabaseConfiguration, // Use your custom configuration class
  }),
  TypeOrmModule.forFeature([Page])],
  controllers: [PagesController],
  providers: [PageService, PageRepository],
})
export class AppModule {

}
