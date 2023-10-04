import { Injectable } from '@nestjs/common';
import { PageRepository } from '../repositories/page.repository';
import { Page } from '../entity/website/page.entity';

@Injectable()
export class PageService {
    constructor(private readonly pageRepository: PageRepository) { }

    async getAllPages() {
        return await this.pageRepository.getAll();
    }

    async getPageById(id: string) {
        return await this.pageRepository.get(id);
    }

    async getPageByRoute(route: string) {
        return await this.pageRepository.getByRoute(route);
    }

    async createPage(pageData: Partial<Page>) {
        return await this.pageRepository.create(pageData);
    }

    async updatePage(id: string, pageData: Partial<Page>) {
        return await this.pageRepository.update(id, pageData);
    }

    async deletePage(id: string) {
        await this.pageRepository.remove(id);
    }
}
