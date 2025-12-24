import { Router } from "express";
import type { Request, Response } from "express";

import { News } from "@/module/news/dto/News.dto.js";
import { NewsService } from "@/module/news/service/NewsService.js";

export const newsController = new Router();

newsController.post('/create', async (req: Request, res: Response) => {
    const newsData: News = req.body;
    const tokenData = '';
    const newsIsCreated = await NewsService.createNews(newsData, tokenData);

    if (newsIsCreated) {
        return res.status(201).send({ message: 'Новость была создана' });
    }

    return res.status(400).send({ message: 'Не удалось создать новость' });
})