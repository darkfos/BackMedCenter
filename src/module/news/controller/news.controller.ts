import { Router } from "express";
import type { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { News, NewsFilter } from "@/module/news";
import { NewsService } from "@/module/news";
import { authMiddleware } from "@/utils";
import redisClient from "@/utils/cache/redis";

class NewsController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initPaths();
  }

  public initPaths() {

    this.router.post("/create", authMiddleware, (req, res) => {
      /*
        #swagger.method = 'POST'
        #swagger.tags = ['News']
        #swagger.summary = 'Создание новости'
        #swagger.description = 'Создание новой новости администратором'
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.responses[201] = {
            description: 'Новость была создана',
            schema: { $ref: '#/definitions/Message' }
        }
        #swagger.responses[400] = {
            description: 'Не удалось создать новость',
            schema: { $ref: '#/definitions/Message' }
        }
      */

      return NewsController.create(req, res);
    });
    this.router.post("/list", (req, res) => {
      /*
        #swagger.method = 'POST'
        #swagger.tags = ['News']
        #swagger.summary = 'Список новостей'
        #swagger.description = 'Получения списка новостей по фильтрам'
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Фильтры для получения новостей',
            required: false,
            schema: {
                $ref: '#/definitions/NewsFilters'
            }
        }

        #swagger.responses[200] = {
            schema: {
                $ref: '#/definitions/NewsList'
            }
        }
        #swagger.responses[400] = {
            schema: {
                $ref: '#/definitions/NewsList'
            }
        }
    */

      return NewsController.list(req, res);
    });
    this.router.put("/update", authMiddleware, (req, res) => {
      /*
                #swagger.method = 'PUT'
                #swagger.tags = ['News']
                #swagger.summary = 'Обновление информации по новости'
                #swagger.description = 'Частичное или полное обновление информации по новосте'
                #swagger.produces = ['application/json']
                #swagger.consumes = ['application/json']

                #swagger.parameters['body'] = {
                    in: 'body',
                    description: 'Поля под обновление',
                    required: false,
                    schema: {
                        $ref: '#/definitions/NewsFilters'
                    }
                }

                #swagger.responses[200] = {
                    description: 'Информация о новосте была обновлена',
                    schema: {
                        $ref: '#/definitions/Message'
                    }
                }
                #swagger.responses[400] = {
                    description: 'Не удалось обновить информацию по новости',
                    schema: {
                        $ref: '#/definitions/Message'
                    }
                }
            */

      return NewsController.update(req, res);
    });
    this.router.delete("/delete", authMiddleware, (req, res) => {
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

      return NewsController.delete(req, res);
    });
  }

  static async create(req: Request & JwtPayload, res: Response) {
    const newsData: News = req.body;
    const newsIsCreated = await NewsService.createNews(newsData, req?.token);

    if (newsIsCreated) {
      return res.status(201).send({ description: "Новость была создана" });
    }

    return res.status(400).send({ description: "Не удалось создать новость" });
  }

  static async list(req: Request & JwtPayload, res: Response) {
    const news = await NewsService.getAll(req.body ?? ({} as NewsFilter));

    if (news[0].length) {
      return res.status(200).json({ list: news[0], total: news[1] });
    }

    return res.status(400).json({ list: [], total: 0 });
  }

  static async update(req: Request & JwtPayload, res: Response) {
    const { id } = req.query;
    const newsIsUpdated = await NewsService.updateNews(
      Number(id),
      req.body as NewsFilter,
    );

    if (!newsIsUpdated) {
      return res
        .status(400)
        .json({ description: "Не удалось обновить информацию по новости" });
    }

    return res
      .status(200)
      .json({ description: "Информация о новосте была обновлена" });
  }

  static async delete(req: Request & JwtPayload, res: Response) {
    const { id } = req.query;
    const newsIsDeleted = await NewsService.deleteNews(Number(id), req?.token);

    if (newsIsDeleted) {
      return res.status(200).send({ description: "Новость была удалена" });
    }

    return res.status(400).send({ description: "Не удалось удалить новость" });
  }
}

export const newsController = new NewsController();
