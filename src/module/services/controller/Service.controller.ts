import { Router, Request, Response } from "express";

import {
  ClinicType,
  ClinicTypeService,
  ConsultService, ReviewService,
} from "@/module/services";
import { authMiddleware } from "@/utils";
import { uploadIcons } from "@/utils/fileManager/storage";
import { isAdminMiddleware } from "@/utils/middlewares/adminMiddleware";
import { JwtPayload } from "jsonwebtoken";
import { ReviewFilter } from "@/module/services/dto/Review.dto";

class ServiceController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post(
      "/clinic/create",
      authMiddleware,
      isAdminMiddleware,
      uploadIcons,
      (req: Request, res: Response) => {
        /*
        #swagger.method = 'POST'
        #swagger.tags = ['Clinic']
        #swagger.summary = 'Созданий нового типа услуг'
        #swagger.description = 'Добавление нового типа услуг'
        #swagger.produces = 'application/json'
        #swagger.consumes = 'multipart/form-data'

        #swagger.parameters['name'] = {
          in: 'formData',
          type: 'string',
          required: true,
          description: 'Название типа'
        }
        #swagger.parameters['icon'] = {
          in: 'formData',
          type: 'file',
          required: true,
          description: 'Иконка типа'
        }

        #swagger.responses[201] = {
          description: 'Новый тип услуг был зарегистирован',
          schema: {
            $ref: '#/definitions/Message'
          }
        }
        #swagger.responses[400] = {
          description: 'Не удалось создать новый тип услуг',
          schema: {
            $ref: '#/definitions/Message'
          }
        }
      */

        return ServiceController.createClinic(req, res);
      },
    );
    this.router.get("/clinic/list", (req: Request, res: Response) => {
      /*
        #swagger.method = 'GET'
        #swagger.tags = ['Clinic']
        #swagger.summary = 'Получение всех типов услуг клиник'
        #swagger.description = 'Получение списка всех типов услуг клиники'
        #swagger.produces = 'application/json'
        #swagger.consumes = 'application/json'

        #swagger.parameters['body'] = {
          in: 'body',
          required: false,
          description: 'Фильтры для поиска определенных услуг',
          schema: {
            name: 'test'
          }
        }

        #swagger.responses[200] = {
          description: 'Список всех услуг поликлиники',
          schema: {
            $ref: '#/definitions/ClinicList'
          }
        }
      */
      return ServiceController.listClinic(req, res);
    });
    this.router.post(
      "/consult/create",
      authMiddleware,
      (req: Request, res: Response) => {
        /*
        #swagger.method = 'POST'
        #swagger.tags = ['Consult']
        #swagger.summary = 'Создание консультации'
        #swagger.description = 'Созданией консультации'
        #swagger.produces = 'application/json'
        #swagger.consumes = 'multipart/form-data'

        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          description: 'Данные для создания консультации',
          schema: {
            $ref: '#/definitions/Consult'
          }
        }

        #swagger.responses[201] = {
          description: 'Запрос на консультацию был отправлен',
          schema: {
            $ref: '#/definitions/Message'
          }
        }
        #swagger.responses[400] = {
          description: 'Не удалось отправить запрос на консультацию',
          schema: {
            $ref: '#/definitions/Message'
          }
        }
      */
        return ServiceController.createConsult(req, res);
      },
    );
    this.router.post(
      "/consult/list",
      isAdminMiddleware,
      (req: Request, res: Response) => {
        /*
        #swagger.method = 'POST'
        #swagger.tags = ['Consult']
        #swagger.summary = 'Получение всех заявок на консультации'
        #swagger.description = 'Получение списка всех заявок на консультации'
        #swagger.produces = 'application/json'
        #swagger.consumes = 'application/json'

        #swagger.parameters['body'] = {
          in: 'body',
          required: false,
          description: 'Фильтры для поиска консультаций',
          schema: {
            $ref: '#/definitions/Consult'
          }
        }

        #swagger.responses[200] = {
          description: 'Список всех заявок',
          schema: {
            $ref: '#/definitions/ConsultList'
          }
        }
      */
        return ServiceController.listConsult(req, res);
      },
    );
    this.router.post("/review/create", authMiddleware, (req: Request, res: Response) => {
      /*
        #swagger.method = 'POST'
        #swagger.tags = ['Review']
        #swagger.summary = 'Создание консультации'
        #swagger.description = 'Созданией консультации'
        #swagger.produces = 'application/json'
        #swagger.consumes = 'multipart/form-data'

        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          description: 'Данные для создания консультации',
          schema: {
            $ref: '#/definitions/Consult'
          }
        }

        #swagger.responses[201] = {
          description: 'Отзыв был создан',
          schema: {
            $ref: '#/definitions/Message'
          }
        }
        #swagger.responses[400] = {
          description: 'Не удалось создать отзыв',
          schema: {
            $ref: '#/definitions/Message'
          }
        }
      */

      return ServiceController.createReview(req, res);
    });
    this.router.post('/review/list', (req: Request, res: Response) => {
      /*
              #swagger.method = 'POST'
              #swagger.tags = ['Review']
              #swagger.summary = 'Получение всех отзывов по фильтрам'
              #swagger.description = 'Получение всех отзывов по фильтрам'
              #swagger.produces = 'application/json'
              #swagger.consumes = 'application/json'

              #swagger.parameters['body'] = {
                in: 'body',
                required: false,
                description: 'Фильтры для поиска отзывов',
                schema: {
                  $ref: '#/definitions/ReviewList'
                }
              }

              #swagger.responses[200] = {
                description: 'Список всех отзывов',
                schema: {
                  $ref: '#/definitions/ReviewFilters'
                }
              }
        */

      return ServiceController.allReviews(req, res);
    });
    // this.router.post("/attendance/create", (req: Request, res: Response) => {});
  }

  static async createClinic(req: Request, res: Response) {
    const clinicTypeData: ClinicType = {
      ...req.body,
      icon: req.file?.filename,
    };
    const clinicTypeIsCreated = await ClinicTypeService.create(clinicTypeData);

    if (clinicTypeIsCreated) {
      return res
        .status(201)
        .json({ message: "Новый тип услуг был зарегистирован" });
    }

    return res
      .status(400)
      .json({ message: "Не удалось создать новый тип услуг" });
  }

  static async listClinic(req: Request, res: Response) {
    const allClinics = await ClinicTypeService.all(req.body);
    return res.status(200).json({ list: allClinics[0], total: allClinics[1] });
  }

  static async createConsult(req: Request, res: Response) {
    const consultIsCreated = await ConsultService.create(req.body);

    if (consultIsCreated) {
      return res
        .status(201)
        .json({ message: "Запрос на консультацию был отправлен" });
    }

    return res
      .status(400)
      .json({ message: "Не удалось создать запрос на консультацию" });
  }

  static async listConsult(req: Request, res: Response) {
    const allConsults = await ConsultService.all(req.body);
    return res
      .status(200)
      .json({ list: allConsults[0], total: allConsults[1] });
  }

  static async createReview(req: Request & JwtPayload, res: Response) {
    const { message, rating, doctorId } = req.body;
    const reviewData = await ReviewService.create({ message, rating }, doctorId, req.token.email);

    if (reviewData) {
      return res.status(201).json({ message: "Отзыв был создан"})
    }

    return res.status(400).json({ message: "Не удалось создать отзыв"})
  }

  static async allReviews(req: Request, res: Response) {
    const data = await req.body;
    const allReviews = await ReviewService.all(data as ReviewFilter);
    return res.status(200).json({ list: allReviews[0], total: allReviews[1] });
  }
}

export const serviceController = new ServiceController();
