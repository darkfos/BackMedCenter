import { Router } from "express";
import type { Request, Response } from "express";

import { News } from "@/module/news/dto/News.dto.js";
import { NewsService } from "@/module/news/service/NewsService.js";
import { authMiddleware } from "@/utils/middlewares/authMiddleware.js";
import { JwtPayload } from "jsonwebtoken";

export const newsRouter = Router();

newsRouter.post('/create', authMiddleware, async (req: Request & JwtPayload, res: Response) => {
    /*
        #swagger.method = 'POST'
        #swagger.tags = ['News']
        #swagger.summary = 'Создание новости'
        #swagger.description = 'Создание новой новости администратором'
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.responses[200] = {
            description: 'Новость была создана',
            schema: { $ref: '#/definitions/Message' }
        }
        #swagger.responses[400] = {
            description: 'Не удалось создать новость',
            schema: { $ref: '#/definitions/Message' }
        }
    */

    const newsData: News = req.body;
    const newsIsCreated = await NewsService.createNews(newsData, req?.token);

    if (newsIsCreated) {
        return res.status(201).send({ description: 'Новость была создана' });
    }

    return res.status(400).send({ description: 'Не удалось создать новость' });
});

newsRouter.delete("/delete", authMiddleware, async (req: Request & JwtPayload, res: Response) => {
    /*
        #swagger.method = 'DELETE'
        #swagger.tags = ['News']
        #swagger.summary = 'Удаление новости'
        #swagger.description = 'Удаление новости администратором'
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.parameters['id'] = {
            in: 'query',
            description: 'Идентификатор новости',
            required: true,
            type: 'integer'
        }

        #swagger.responses[200] = {
            description: 'Новость была удалена',
            schema: { $ref: '#/definitions/Message' }
        }
        #swagger.responses[400] = {
            description: 'Не удалось удалить новость',
            schema: { $ref: '#/definitions/Message' }
        }
    */

    const { id } = req.query;
    const newsIsDeleted = await NewsService.deleteNews(Number(id), req?.token);

    if (newsIsDeleted) {
        return res.status(200).send({ description: 'Новость была удалена'});
    }

    return res.status(400).send({ description: 'Не удалось удалить новость' });
});

newsRouter.post("/create", authMiddleware, async (req: Request & JwtPayload, res: Response) => {
    /*
        #swagger.method = 'POST'
        #swagger.tags = ['News']
        #swagger.summary = 'Создание новости'
        #swagger.description = 'Создание новости по выбранной теме'
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.parameters['body'] = {
          in: 'body',
          description: 'Данные новой новости',
          required: true,
          schema: {
              $ref: '#/definitions/CreateNews'
          }
        }

        #swagger.responses[201] = {
            description: 'Новость была создана',
            schema: {
                $ref: '#/definitions/Message'
            }
        }
        #swagger.responses[400] = {
            description: 'Не удалось создать новость',
            $ref: '#/definitions/Message'
        }
    */

    const newsIsCreated = await NewsService.createNews(req.body as News, req?.token);

    if (newsIsCreated) {
        return res.status(201).send({
            description: 'Новость была создана'
        })
    }

    return res.status(400).send(
        {
            description: 'Не удалось создать новость'
        }
    )
})