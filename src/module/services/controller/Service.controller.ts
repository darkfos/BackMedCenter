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
    this.router.get("/clinic/doctors", (req: Request, res: Response) => {
      /*
        #swagger.method = 'GET'
        #swagger.tags = ['Clinic']
        #swagger.summary = 'Получение всех типов клиник с количеством докторов'
        #swagger.description = 'Возвращает объект: ключ — id типа клиники, значение — name, clinicLocaleName, doctorCnt'
        #swagger.produces = 'application/json'

        #swagger.responses[200] = {
          description: 'Типы клиник с количеством докторов по каждому',
          schema: { $ref: '#/definitions/ClinicTypeWithDoctorCnt' }
        }
      */
      return ServiceController.listClinicWithDoctorCnt(req, res);
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
    this.router.get('/doctor/oldest', (req: Request, res: Response) => {
      return ServiceController.getOldestDoctors(req, res);
    });
    this.router.get('/doctor/:id', (req: Request<{ id: string }>, res: Response) => {
      return ServiceController.getDoctorById(req, res);
    });
    this.router.get('/doctor/:id/reviews', (req: Request<{ id: string }>, res: Response) => {
      return ServiceController.getDoctorReviews(req, res);
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
    this.router.get(
      '/consult_price',
      (req: Request, res: Response) => {
        return ServiceController.getTypeConsultPrice(req, res);
      }
    )
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

  static async listClinicWithDoctorCnt(req: Request, res: Response) {
    const data = await MedicalServiceService.getAllWithDoctorCnt();
    return res.status(200).json(data);
  }

  static async getOldestDoctors(req: Request, res: Response) {
    const data = await MedicalServiceService.getOldestDoctors();
    return res.status(200).json(data);
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
    const email = req.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const { message, rating, doctorId: rawDoctorId } = req.body ?? {};
    const doctorId = Number(rawDoctorId);
    if (Number.isNaN(doctorId) || !message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ message: "Укажите врача (doctorId), текст отзыва (message) и оценку (rating)" });
    }
    const ratingNum = rating != null ? Number(rating) : 5;
    const result = await ReviewService.create(
      { message: message.trim(), rating: ratingNum },
      doctorId,
      email as string,
    );

    if (result.success) {
      return res.status(201).json({ message: "Отзыв был создан" });
    }

    return res.status(400).json({ message: result.reason || "Не удалось создать отзыв" });
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

  static async getDoctorById(req: Request<{ id: string }>, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id доктора" });
    }
    const doctor = await ServService.getDoctorById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Доктор не найден" });
    }
    const reviews = Array.isArray(doctor.doctorReviews) ? doctor.doctorReviews : [];
    const sanitizedReviews = reviews.map((r) => {
      const rec = r as unknown as { user?: { password?: string; fullName?: string; [k: string]: unknown }; [k: string]: unknown };
      const { user, ...reviewRest } = rec;
      const userSafe = user ? (() => { const { password: __, ...u } = user; return u; })() : undefined;
      return { ...reviewRest, user: userSafe };
    });
    const doc = doctor as unknown as { password?: string; doctorReviews?: unknown; [k: string]: unknown };
    const { password: _, doctorReviews: __, ...doctorRest } = doc;
    const body = { ...doctorRest, doctorReviews: sanitizedReviews };
    return res.status(200).json(body);
  }

  static async getDoctorReviews(req: Request<{ id: string }>, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id доктора" });
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 5));
    const { list, total } = await ReviewService.getByDoctorId(id, page, pageSize);
    const sanitized = list.map((r) => {
      const rec = r as unknown as { user?: { password?: string; fullName?: string; [k: string]: unknown }; [k: string]: unknown };
      const { user, ...rest } = rec;
      const userSafe = user ? (() => { const { password: __, ...u } = user; return u; })() : undefined;
      return { ...rest, user: userSafe };
    });
    return res.status(200).json({ list: sanitized, total, page, pageSize });
  }

  static async listServices(req: Request, res: Response) {
    const list = await MedicalServiceService.getAll();
    return res.status(200).json(list);
  }

  /** Убирает password из врачей в списке услуг при отдаче в API. */
  private static sanitizeServicesForResponse(services: unknown[]): unknown[] {
    return services.map((s) => {
      const svc = s as { doctors?: Array<{ password?: string; [k: string]: unknown }>; [k: string]: unknown };
      if (Array.isArray(svc.doctors)) {
        const doctors = svc.doctors.map((d) => {
          const { password: _, ...rest } = d;
          return rest;
        });
        return { ...svc, doctors };
      }
      return svc;
    });
  }

  static async filterServices(req: Request, res: Response) {
    const filtersServices = await MedicalServiceService.getServiceByFilters(req.query);
    const sanitized = ServiceController.sanitizeServicesForResponse(filtersServices);
    return res.status(200).json(sanitized);
  }

  static async createService(req: Request, res: Response) {
    const record = await MedicalServiceService.create(req.body);
    if (record) {
      const [sanitized] = ServiceController.sanitizeServicesForResponse([record]);
      return res.status(201).json(sanitized);
    }
    return res.status(400).json({
      message: "Не удалось создать услугу. Проверьте clinicTypeId.",
    });
  }

  static async getTypeConsultPrice(req: Request, res: Response) {
    const typeConsults = await MedicalServiceService.getTypeConsult();
    return res.status(200).json(typeConsults);
  }
}

export const serviceController = new ServiceController();
