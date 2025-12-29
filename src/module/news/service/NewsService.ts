import { dbSource } from "@/db/data-source.js";
import { News as NewsTable } from "@/module/news/entity/News.entity.js";

import type { News } from "@/module/news/dto/News.dto.js";
import { User } from "@/module/users/entity/User.entity.js";
import { AuthService } from "@/module/auth/service/AuthService.js";

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
}