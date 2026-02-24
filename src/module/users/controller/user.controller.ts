import { Router, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { authMiddleware } from "@/utils/middlewares/authMiddleware.js";
import { validateBodyDTOMiddleware } from "@/utils/middlewares/validateDTOMiddleware.js";
import { uploadImage } from "@/utils/fileManager/storage.js";
import { isAdminMiddleware } from "@/utils/middlewares/adminMiddleware.js";
import { UserService, CreateDoctorDTO, UpdateDoctorDTO, UpdateProfileDTO } from "@/module/users";
import { MedicalHistoryService } from "@/module/pacients/service/MedicalHistory.service.js";
import { AppointmentsService } from "@/module/pacients/service/Appointments.service.js";
import { CreateAppointmentDTO } from "@/module/pacients/dto/CreateAppointment.dto.js";
import { DoctorAvailabilityService } from "@/module/pacients/service/DoctorAvailability.service.js";

/** Запрос на создание доктора: body проверен validateBodyDTOMiddleware(CreateDoctorDTO), доступ — только админ */
interface CreateDoctorRequest extends Request {
  body: CreateDoctorDTO;
}

/** Запрос на обновление доктора: body проверен validateBodyDTOMiddleware(UpdateDoctorDTO), доступ — только админ */
interface UpdateDoctorRequest extends Request {
  body: UpdateDoctorDTO;
  params: { id: string };
}

/** Запрос с id доктора в params (удаление, получение пациентов); доступ — только админ */
interface DoctorIdParamsRequest extends Request {
  params: { id: string };
}

/** Запрос на обновление профиля (персональные данные); body — UpdateProfileDTO */
interface UpdateProfileRequest extends Request {
  body: UpdateProfileDTO;
}

/** Запрос на создание приёма; body — CreateAppointmentDTO */
interface CreateAppointmentRequest extends Request {
  body: CreateAppointmentDTO;
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

class UserController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get(
      "/info",
      authMiddleware,
      async (req: Request, res: Response) => {
        /*
                #swagger.method = 'GET'
                #swagger.tags = ['Users']
                #swagger.summary = 'Получение информации о пользователе'
                #swagger.description = 'Получение полной информации о пользователе'
                #swagger.produces = ['application/json']
                #swagger.consumes = ['application/json']

                #swagger.responses[200] = {
                    description: 'Информация о пользователе',
                    schema: {
                      $ref: '#/definitions/User'
                    }
                }
                #swagger.responses[400] = {
                    description: 'Не удалось получить информацию по пользователю',
                    schema: {
                        $ref: '#/definitions/Message'
                    }
                }
            */

        return UserController.info(req, res);
      },
    );
    this.router.patch(
      "/update-password",
      authMiddleware,
      async (req: Request, res: Response) => {
        /*
                #swagger.method = 'PATCH'
                #swagger.tags = ['Users']
                #swagger.summary = 'Обновление пароля'
                #swagger.description = 'Обновление пароля пользователя'
                #swagger.produces = ['application/json']
                #swagger.consumes = ['application/json']

                #swagger.parameters['body'] = {
                    in: 'body',
                    description: 'Получение нового пароля',
                    required: true,
                    schema: {
                        new_password: 'Новый пароль'
                    }
                }

                #swagger.responses[200] = {
                    description: 'Пароль успешно обновлен',
                    schema: {
                        $ref: '#/definitions/Message'
                    }
                }
                #swagger.responses[400] = {
                    description: 'Не удалось обновить пароль',
                    schema: {
                        $ref: '#/definitions/Message'
                    }
                }
            */

        return UserController.updatePassword(req, res);
      },
    );
    this.router.patch(
      "/profile",
      authMiddleware,
      validateBodyDTOMiddleware(UpdateProfileDTO),
      async (req: UpdateProfileRequest, res: Response) => {
        /*
                #swagger.tags = ['Users']
                #swagger.summary = 'Обновление персональных данных'
                #swagger.description = 'Обновление имени, email, телефона, номера полиса текущего пользователя'
                #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/UpdateProfile' } }
                #swagger.responses[200] = { description: 'Данные обновлены', schema: { $ref: '#/definitions/User' } }
                #swagger.responses[400] = { description: 'Ошибка валидации или email занят', schema: { $ref: '#/definitions/Message' } }
                #swagger.responses[401] = { description: 'Требуется авторизация', schema: { $ref: '#/definitions/Message' } }
            */
        return UserController.updateProfile(req, res);
      },
    );
    this.router.get(
      "/me/history",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyMedicalHistory(req, res);
      },
    );
    this.router.get(
      "/me/appointments",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyAppointments(req, res);
      },
    );
    this.router.post(
      "/me/appointments",
      authMiddleware,
      validateBodyDTOMiddleware(CreateAppointmentDTO),
      async (req: CreateAppointmentRequest, res: Response) => {
        return UserController.createAppointment(req, res);
      },
    );
    this.router.post(
      "/doctor",
      authMiddleware,
      isAdminMiddleware,
      validateBodyDTOMiddleware(CreateDoctorDTO),
      async (req: CreateDoctorRequest, res: Response) => {
        /*
                #swagger.tags = ['Doctors']
                #swagger.summary = 'Создание нового доктора'
                #swagger.description = 'Создание нового пользователя с типом доктор (только для администраторов)'
                #swagger.produces = ['application/json']
                #swagger.consumes = ['application/json']
                #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/CreateDoctor' } }
                #swagger.responses[201] = { description: 'Доктор успешно создан', schema: { $ref: '#/definitions/User' } }
                #swagger.responses[400] = { description: 'Ошибка валидации или email уже занят', schema: { $ref: '#/definitions/Message' } }
                #swagger.responses[401] = { description: 'Требуются права администратора', schema: { $ref: '#/definitions/Message' } }
            */
        return UserController.createDoctor(req, res);
      },
    );
    this.router.patch(
      "/doctor/:id",
      authMiddleware,
      isAdminMiddleware,
      validateBodyDTOMiddleware(UpdateDoctorDTO),
      async (req: UpdateDoctorRequest, res: Response) => {
        /*
                #swagger.tags = ['Doctors']
                #swagger.summary = 'Обновление информации о докторе'
                #swagger.description = 'Обновление данных доктора по id (только для администраторов)'
                #swagger.produces = ['application/json']
                #swagger.consumes = ['application/json']
                #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', description: 'ID доктора' }
                #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/UpdateDoctor' } }
                #swagger.responses[200] = { description: 'Данные доктора обновлены', schema: { $ref: '#/definitions/User' } }
                #swagger.responses[400] = { description: 'Ошибка валидации', schema: { $ref: '#/definitions/Message' } }
                #swagger.responses[401] = { description: 'Требуются права администратора', schema: { $ref: '#/definitions/Message' } }
                #swagger.responses[404] = { description: 'Доктор не найден', schema: { $ref: '#/definitions/Message' } }
            */
        return UserController.updateDoctor(req, res);
      },
    );
    this.router.delete(
      "/doctor/:id",
      authMiddleware,
      isAdminMiddleware,
      async (req: DoctorIdParamsRequest, res: Response) => {
        /*
                #swagger.tags = ['Doctors']
                #swagger.summary = 'Удаление доктора'
                #swagger.description = 'Удаление доктора по id. Пациенты открепляются от доктора. Только для администраторов.'
                #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', description: 'ID доктора' }
                #swagger.responses[200] = { description: 'Доктор удалён', schema: { $ref: '#/definitions/Message' } }
                #swagger.responses[401] = { description: 'Требуются права администратора', schema: { $ref: '#/definitions/Message' } }
                #swagger.responses[404] = { description: 'Доктор не найден', schema: { $ref: '#/definitions/Message' } }
            */
        return UserController.deleteDoctor(req, res);
      },
    );
    this.router.get(
      "/doctor/:id/available-slots",
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.getDoctorAvailableSlots(req, res);
      },
    );
    this.router.get(
      "/doctor/:id/pacients",
      authMiddleware,
      isAdminMiddleware,
      async (req: DoctorIdParamsRequest, res: Response) => {
        /*
                #swagger.tags = ['Doctors']
                #swagger.summary = 'Получение пациентов доктора'
                #swagger.description = 'Список всех пациентов, закреплённых за доктором. Только для администраторов.'
                #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', description: 'ID доктора' }
                #swagger.responses[200] = { description: 'Список пациентов', schema: { $ref: '#/definitions/DoctorPacientsList' } }
                #swagger.responses[401] = { description: 'Требуются права администратора', schema: { $ref: '#/definitions/Message' } }
                #swagger.responses[404] = { description: 'Доктор не найден', schema: { $ref: '#/definitions/Message' } }
            */
        return UserController.getDoctorPacients(req, res);
      },
    );
    this.router.patch(
      "/doctor/:id/avatar",
      authMiddleware,
      uploadImage,
      async (req: Request, res: Response) => {
        /*
                #swagger.tags = ['Doctors']
                #swagger.summary = 'Загрузка аватара доктора'
                #swagger.description = 'Загрузка/обновление аватара доктора. Доступ: администратор или сам доктор (по id). Формат: multipart/form-data, поле "image".'
                #swagger.consumes = ['multipart/form-data']
                #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', description: 'ID доктора' }
                #swagger.parameters['image'] = { in: 'formData', type: 'file', required: true, description: 'Файл изображения (jpeg, png, jpg)' }
                #swagger.responses[200] = { description: 'Аватар обновлён', schema: { $ref: '#/definitions/User' } }
                #swagger.responses[400] = { description: 'Файл не передан или некорректный', schema: { $ref: '#/definitions/Message' } }
                #swagger.responses[403] = { description: 'Нет прав на обновление аватара', schema: { $ref: '#/definitions/Message' } }
                #swagger.responses[404] = { description: 'Доктор не найден', schema: { $ref: '#/definitions/Message' } }
            */
        return UserController.uploadDoctorAvatar(req, res);
      },
    );
  }

  static async info(req: Request & JwtPayload, res: Response) {
    const user = await UserService.getUserByEmail(req?.token?.email);

    if (user) {
      return res.status(200).json(user);
    }

    return res.status(404).json({
      message: "Пользователь не найден",
    });
  }

  static async updatePassword(req: Request & JwtPayload, res: Response) {
    const { new_password } = req.body;
    const passwordIsUpdated = await UserService.updatePassword(
      req?.token?.email,
      new_password,
    );

    if (passwordIsUpdated) {
      return res.status(200).json({
        message: "Пароль успешно обновлен",
      });
    }

    return res.status(400).json({
      message: "Не удалось обновить пароль",
    });
  }

  static async updateProfile(req: Request & JwtPayload & UpdateProfileRequest, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const updated = await UserService.updateProfile(email, req.body);
    if (updated) {
      return res.status(200).json(updated);
    }
    return res.status(400).json({
      message: "Не удалось обновить данные (возможно, email уже занят)",
    });
  }

  static async getMyMedicalHistory(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    const list = await MedicalHistoryService.getByUserId(user.id);
    return res.status(200).json(list);
  }

  static async getMyAppointments(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    const list = await AppointmentsService.getByUserId(user.id);
    return res.status(200).json(list);
  }

  static async createAppointment(
    req: Request & JwtPayload & CreateAppointmentRequest,
    res: Response,
  ) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    const record = await AppointmentsService.create(user.id, req.body);
    if (record) {
      return res.status(201).json(record);
    }
    return res.status(400).json({
      message: "Не удалось создать приём. Проверьте, что указан существующий id доктора.",
    });
  }

  static async createDoctor(req: CreateDoctorRequest, res: Response) {
    const body = req.body;
    const newDoctor = await UserService.createDoctor(body);

    if (newDoctor) {
      const { password: _, ...rest } = newDoctor;
      return res.status(201).json(rest);
    }

    return res.status(400).json({
      message: "Не удалось создать доктора (возможно, email уже занят)",
    });
  }

  static async updateDoctor(req: UpdateDoctorRequest, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id доктора" });
    }

    const updated = await UserService.updateDoctor(id, req.body);

    if (updated) {
      return res.status(200).json(updated);
    }

    return res.status(404).json({
      message: "Доктор не найден",
    });
  }

  static async deleteDoctor(req: DoctorIdParamsRequest, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id доктора" });
    }

    const deleted = await UserService.deleteDoctor(id);

    if (deleted) {
      return res.status(200).json({ message: "Доктор удалён" });
    }

    return res.status(404).json({
      message: "Доктор не найден",
    });
  }

  static async getDoctorAvailableSlots(
    req: Request<{ id: string }>,
    res: Response,
  ) {
    const id = Number(req.params.id);
    const from =
      typeof req.query.from === "string" ? req.query.from : null;
    const to = typeof req.query.to === "string" ? req.query.to : null;
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id доктора" });
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const today = new Date();
    const defaultFrom = formatDateStr(today);
    const defaultTo = formatDateStr(
      new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    );
    const fromStr = from && dateRegex.test(from) ? from : defaultFrom;
    const toStr = to && dateRegex.test(to) ? to : defaultTo;
    if (fromStr > toStr) {
      return res
        .status(400)
        .json({ message: "Параметр from не должен быть позже to" });
    }

    const result = await DoctorAvailabilityService.getAvailableDatesWithSlots(
      id,
      fromStr,
      toStr,
    );
    if (result === null) {
      return res.status(404).json({ message: "Доктор не найден" });
    }
    return res.status(200).json(result);
  }

  static async getDoctorPacients(req: DoctorIdParamsRequest, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id доктора" });
    }

    const patients = await UserService.getPatientsByDoctorId(id);

    if (patients === null) {
      return res.status(404).json({
        message: "Доктор не найден",
      });
    }

    return res.status(200).json(patients);
  }

  static async uploadDoctorAvatar(req: Request & JwtPayload, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id доктора" });
    }
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file?.filename) {
      return res.status(400).json({
        message: "Файл изображения не передан. Отправьте multipart/form-data с полем «image» (jpeg, png, jpg).",
      });
    }

    const email = req.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    let currentUser: { id?: number; isAdmin?: boolean };
    try {
      currentUser = await UserService.getUserByEmail(email) as { id?: number; isAdmin?: boolean };
    } catch {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    const isAdmin = currentUser.isAdmin === true;
    const isOwnProfile = currentUser.id === id;
    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({
        message: "Загрузка аватара доступна только администратору или самому доктору",
      });
    }

    const updated = await UserService.updateDoctorAvatar(id, file.filename);
    if (updated) {
      return res.status(200).json(updated);
    }
    return res.status(404).json({ message: "Доктор не найден" });
  }
}

export const userController = new UserController();
