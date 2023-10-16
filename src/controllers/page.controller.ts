import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PageService } from '../services/page.service';
import { Page } from '../entity/website/page.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin-guard';
import * as nodemailer from 'nodemailer';
import { EmailService } from '../services/email.service';

@Controller('api/pages')
@ApiTags('Pages') // Optional: Group your API under a tag
export class PagesController {
  constructor(private readonly pagesService: PageService, private readonly emailService: EmailService) { }
  @Get()
  @ApiOperation({ operationId: 'findAll', summary: 'Get all pages' })
  @ApiResponse({ status: 200, description: 'Returns all pages', type: Page, isArray: true })
  async findAll(): Promise<Page[]> {
    return this.pagesService.getAllPages();
  }

  @Get(':route')
  @ApiOperation({ operationId: 'findOne', summary: 'Get a page by route' })
  @ApiParam({ name: 'route', type: String, description: 'Page Route' })
  @ApiResponse({ status: 200, description: 'Returns a page by route', type: Page })
  async findOne(@Param('route') route: string): Promise<Page | undefined> {
    return this.pagesService.getPageByRoute(route);
  }

  @Post()
  @ApiOperation({ operationId: 'create', summary: 'Create a new page' })
  @ApiBody({ type: Page, description: 'Page data to create' })
  @ApiResponse({ status: 201, description: 'Creates a new page', type: Page })
  @UseGuards(AdminGuard)
  async create(@Body() pageData: Partial<Page>): Promise<Page> {
    return this.pagesService.createPage(pageData);
  }

  @Put(':id')
  @ApiOperation({ operationId: 'update', summary: 'Update a page by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Page ID' })
  @ApiBody({ type: Page, description: 'Updated page data' })
  @ApiResponse({ status: 200, description: 'Updates a page by ID', type: Page })
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() pageData: Partial<Page>): Promise<Page | undefined> {
    return this.pagesService.updatePage(id, pageData);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'remove', summary: 'Delete a page by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Page ID' })
  @ApiResponse({ status: 204, description: 'Deletes a page by ID' })
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string): Promise<void> {
    await this.pagesService.deletePage(id);
  }
}
