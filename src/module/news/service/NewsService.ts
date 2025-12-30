import { FindOptionsWhere, ILike } from "typeorm";

import { dbSource } from "@/db/data-source.js";
import { News as NewsTable } from "@/module/news";

import type {News, NewsFilter} from "@/module/news";
import { User } from "@/module/users";
import { AuthService } from "@/module/auth";

export class NewsService {

    protected static repository = dbSource.getRepository(NewsTable);

    static async createNews(news: News, userData: { email: string }) {
        const user = await AuthService.userIsAdmin(userData.email) as User;

        if (user && user?.isAdmin) {
            (news as NewsTable).user = user;
            await this.repository.save(news);
            return news;
        }

        return false;
    }

    static async deleteNews(idNews: number, userData: { email: string }) {
        const user = await AuthService.userIsAdmin(userData.email) as User;

        if (user && user?.isAdmin) {
            const isDeleted = await this.repository.delete(idNews);
            return isDeleted
        }

        return false;
    }

    static async getAll(filters: Partial<NewsFilter>) {
        const where: FindOptionsWhere<NewsFilter> = {};

        if (filters.type) {
            where['type'] = filters.type;
        }

        if (filters.description) {
            where['description'] = ILike(`%${filters.description}%`);
        }

        if (filters.title) {
            where['title'] = ILike(`%${filters.title}%`)
        }

        if (filters.createDate) {
            where['createDate'] = filters.createDate;
        }

        if (filters.updateDate) {
            where['updateDate'] = filters.updateDate;
        }


        return await this.repository.findAndCount({
            where
        })
    }

    static async updateNews(idNews: number, dataToUpdate: NewsFilter) {
        return await this.repository.update(idNews, dataToUpdate);
    }
}