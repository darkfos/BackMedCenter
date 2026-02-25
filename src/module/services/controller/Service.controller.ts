import { Router, Request, Response } from "express";

import {
  ClinicType,
  ClinicTypeService,
  ConsultService,
  ReviewService,
  ServService,
} from "@/module/services";
import { MedicalServiceService } from "@/module/services/service/medicalService.service.js";
import { CreateServiceDTO } from "@/module/services/dto/CreateService.dto.js";
import { authMiddleware } from "@/utils/middlewares/authMiddleware.js";
import { validateBodyDTOMiddleware } from "@/utils/middlewares/validateDTOMiddleware.js";
import { uploadIcons } from "@/utils/fileManager/storage.js";
import { isAdminMiddleware } from "@/utils/middlewares/adminMiddleware.js";
import { JwtPayload } from "jsonwebtoken";
import { ReviewFilter } from "@/module/services/dto/Review.dto";
import { ConsultDTO} from "@/module/services/dto/Consult.dto";
import { validateQueryDTOMiddleware } from "@/utils/middlewares/validateDTOMiddleware.js";
import { DoctorDTO } from "@/module/services/dto/Doctor.dto";
import { MedicalServiceDTO } from "@/module/services/dto/ClinicType.dto";
import { ClinicDTO } from "@/module/services/dto/ClinicType.dto";

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
      validateBodyDTOMiddleware(ClinicDTO),
      (req: Request, res: Response) => {
        /*
        #swagger.method = 'POST'
        #swagger.tags = ['Clinic']
        #swagger.summary = 'Созданий нового типа услуг'
        #swagger.description = 'Добавление нового типа услуг'
        #swagger.produces = 'application/json'
        #swagger.consumes = 'multipart/form-data'

        #swagger.parameters['name'] = {
          in: 'body',
          type: 'string',
          required: true,
          description: 'Название типа'
        }
        #swagger.parameters['icon'] = {
          in: 'body',
          type: 'string',
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
        #swagger.summary = 'Получение всех типов услуг клиники'
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
      validateBodyDTOMiddleware(ConsultDTO),
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
    this.router.get('/doctor/list', validateQueryDTOMiddleware(DoctorDTO), (req: Request, res: Response) => {
      /*
        #swagger.method = 'GET'
        #swagger.tags = ['Doctors']
        #swagger.summary = 'Получение всех докторов по фильтрам'
        #swagger.description = 'Получение всех докторов по фильтрам'
        #swagger.produces = 'application/json'
        #swagger.consumes = 'application/json'

        #swagger.parameters['body'] = {
          in: 'body',
          required: false,
          description: 'Фильтры для поиска доктора',
          schema: {
            $ref: '#/definitions/ReviewList'
          }
        }

        #swagger.responses[200] = {
          description: 'Список всех отзывов',
          schema: {
            $ref: '#/definitions/DoctorFilters'
          }
        }
      */

      return ServiceController.getDoctors(req, res);
    });
    this.router.get("/services", (req: Request, res: Response) => {
      return ServiceController.listServices(req, res);
    });
    this.router.get('/services/filter', validateQueryDTOMiddleware(MedicalServiceDTO), (req: Request, res: Response) => {
      return ServiceController.filterServices(req, res);
    });
    this.router.post(
      "/services",
      authMiddleware,
      isAdminMiddleware,
      validateBodyDTOMiddleware(CreateServiceDTO),
      (req: Request, res: Response) => {
        return ServiceController.createService(req, res);
      },
    );
  }

  static async createClinic(req: Request, res: Response) {
    const clinicTypeData: ClinicType = {
      ...req.body,
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

    if (!data) {
      return res.status(200).json({ list: [], total: 0 });
    }

    const allReviews = await ReviewService.all(data as ReviewFilter);
    return res.status(200).json({ list: allReviews[0], total: allReviews[1] });
  }

  static async getDoctors(req: Request, res: Response) {
    const params: DoctorDTO = req.query as unknown as DoctorDTO;
    const allDoctors = await ServService.getDoctors(params.username, params.specialization, params.formatWork, Number(params.page), Number(params.pageSize));

    return res.status(200).json(allDoctors);
  }

  static async listServices(req: Request, res: Response) {
    const list = await MedicalServiceService.getAll();
    return res.status(200).json(list);
  }

  static async filterServices(req: Request, res: Response) {
    const filtersServices = await MedicalServiceService.getServiceByFilters(req.query);
    return res.status(200).json(filtersServices)
  }

  static async createService(req: Request, res: Response) {
    const record = await MedicalServiceService.create(req.body);
    if (record) {
      return res.status(201).json(record);
    }
    return res.status(400).json({
      message: "Не удалось создать услугу. Проверьте clinicTypeId.",
    });
  }
}

export const serviceController = new ServiceController();
