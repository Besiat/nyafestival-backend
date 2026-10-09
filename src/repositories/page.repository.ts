import { Injectable } from '@nestjs/common';
import { Raw, Repository } from 'typeorm';
import { Page } from '../entity/website/page.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PageRepository {
    constructor(
        @InjectRepository(Page) private readonly pageRepository: Repository<Page>,
    ) { }

    async getAll(): Promise<Page[]> {
        return await this.pageRepository.find();
    }

    async getCosplayPages(): Promise<Pick<Page, 'pageId' | 'route' | 'title' | 'order'>[]> {
        return await this.pageRepository.find({
            select: {
                pageId: true,
                route: true,
                title: true,
                order: true,
            },
            where: {
                route: Raw((column) => `${column} ~ :cosplayRoutePattern`, {
                    cosplayRoutePattern: '^contest/cosplay/[^/]+$',
                }),
            },
            order: {
                order: { direction: 'ASC', nulls: 'LAST' },
                route: 'ASC',
            },
        });
    }

    async get(id: string): Promise<Page | undefined> {
        return await this.pageRepository.findOne({
            where: {
                pageId: id,
            }
        })
    }

    async getByRoute(route: string): Promise<Page | undefined> {
        return await this.pageRepository.findOne({
            where: {
                route
            }
        })
    }

    async create(pageData: Partial<Page>): Promise<Page> {
        const page = this.pageRepository.create(pageData);
        return await this.pageRepository.save(page);
    }

    async update(id: string, pageData: Partial<Page>): Promise<Page | undefined> {
        await this.pageRepository.update(id, pageData);
        return this.get(id);
    }

    async remove(id: string): Promise<void> {
        await this.pageRepository.delete(id);
    }
}
