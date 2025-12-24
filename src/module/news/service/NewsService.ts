import { dbSource } from "@/db/data-source.js";
import { News as NewsTable } from "@/module/news/entity/News.entity.js";

import type { News } from "@/module/news/dto/News.dto.js";
import { User } from "@/module/users/entity/User.entity.js";

export class NewsService {

    protected static repository = dbSource.getRepository(NewsTable);

    static async createNews(news: News, userData: { email: string }) {
        const user = await dbSource.getRepository(User).findOne({ where: { email: userData.email } });

        if (user?.isAdmin) {
            news.userid = user.id;
            await this.repository.create(news);
            await this.repository.save(news);
            return news;
        }

        return false;
    }
}