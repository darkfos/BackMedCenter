import { Router, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { authMiddleware } from "@/utils/middlewares/authMiddleware.js";
import { validateBodyDTOMiddleware } from "@/utils/middlewares/validateDTOMiddleware.js";
import { uploadImage } from "@/utils/fileManager/storage.js";
import { isAdminMiddleware } from "@/utils/middlewares/adminMiddleware.js";
import { UserService, CreateDoctorDTO, UpdateDoctorDTO, UpdateProfileDTO } from "@/module/users";
import { UserTypes } from "@/utils/shared/entities_enums.js";
import { ActivityService } from "@/module/activities";
import { MedicalHistoryService } from "@/module/pacients/service/MedicalHistory.service.js";
import { AppointmentsService } from "@/module/pacients/service/Appointments.service.js";
import { CreateAppointmentDTO } from "@/module/pacients/dto/CreateAppointment.dto.js";
import { DoctorAvailabilityService } from "@/module/pacients/service/DoctorAvailability.service.js";
import { PrescriptionService } from "@/module/pacients/service/Prescription.service.js";
import { PrescriptionRenewalRequestService } from "@/module/pacients/service/PrescriptionRenewalRequest.service.js";
import { NurseTaskService, NurseTaskFilter } from "@/module/pacients/service/NurseTask.service.js";
import { InventoryService } from "@/module/pacients/service/Inventory.service.js";
import { AnalysisService } from "@/module/analysis/service/AnalysisService.js";

interface CreateDoctorRequest extends Request {
  body: CreateDoctorDTO;
}

interface UpdateDoctorRequest extends Request {
  body: UpdateDoctorDTO;
  params: { id: string };
}

interface DoctorIdParamsRequest extends Request {
  params: { id: string };
}

interface UpdateProfileRequest extends Request {
  body: UpdateProfileDTO;
}

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
    this.router.get(
      "/me/patients/:cardId/prescriptions",
      authMiddleware,
      async (req: Request<{ cardId: string }>, res: Response) => {
        return UserController.getCardPrescriptions(req, res);
      },
    );
    this.router.get(
      "/me/patients/:cardId/analyses",
      authMiddleware,
      async (req: Request<{ cardId: string }>, res: Response) => {
        return UserController.getCardAnalyses(req, res);
      },
    );
    this.router.get(
      "/me/patients",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyPatients(req, res);
      },
    );
    this.router.get(
      "/me/visits-today",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyVisitsToday(req, res);
      },
    );
    this.router.patch(
      "/me/visits/:id/cancel",
      authMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.cancelMyVisit(req, res);
      },
    );
    this.router.post(
      "/me/prescriptions",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.createPrescription(req, res);
      },
    );
    this.router.post(
      "/me/analyses",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.createAnalysis(req, res);
      },
    );
    this.router.get(
      "/me/prescriptions",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyPrescriptions(req, res);
      },
    );
    this.router.get(
      "/me/balance",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyBalance(req, res);
      },
    );
    this.router.post(
      "/me/prescriptions/:id/renew-request",
      authMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.createPrescriptionRenewalRequest(req, res);
      },
    );
    this.router.get(
      "/me/prescription-renewal-requests",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyPrescriptionRenewalRequests(req, res);
      },
    );
    this.router.get(
      "/me/renewal-requests",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyRenewalRequests(req, res);
      },
    );
    this.router.patch(
      "/me/renewal-requests/:id",
      authMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.patchRenewalRequest(req, res);
      },
    );
    this.router.get(
      "/me/tasks",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyTasks(req, res);
      },
    );
    this.router.post(
      "/me/tasks",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.createMyTask(req, res);
      },
    );
    this.router.patch(
      "/me/tasks/:id/complete",
      authMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.completeMyTask(req, res);
      },
    );
    this.router.patch(
      "/me/tasks/:id/note",
      authMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.setMyTaskNote(req, res);
      },
    );
    this.router.get(
      "/me/shift-stats",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyShiftStats(req, res);
      },
    );
    this.router.get(
      "/me/shift-journal",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyShiftJournal(req, res);
      },
    );
    this.router.get(
      "/me/inventory",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getMyInventory(req, res);
      },
    );
    this.router.post(
      "/me/inventory",
      authMiddleware,
      async (req: Request, res: Response) => {
        return UserController.createInventoryItem(req, res);
      },
    );
    this.router.patch(
      "/me/inventory/:id/add",
      authMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.addInventoryQuantity(req, res);
      },
    );
    this.router.patch(
      "/me/inventory/:id",
      authMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.updateInventoryItem(req, res);
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
    this.router.get(
      "/admin/stats",
      authMiddleware,
      isAdminMiddleware,
      async (_req: Request, res: Response) => {
        return UserController.getAdminStats(res);
      },
    );
    this.router.get(
      "/admin/pending-approval",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getPendingApproval(req, res);
      },
    );
    this.router.patch(
      "/admin/pending-approval/:id/approve",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.approveUser(req, res);
      },
    );
    this.router.patch(
      "/admin/pending-approval/:id/reject",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.rejectUser(req, res);
      },
    );
    this.router.get(
      "/admin/activities",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getActivities(req, res);
      },
    );
    this.router.post(
      "/admin/backup",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request, res: Response) => {
        return UserController.backupSystem(req, res);
      },
    );
    this.router.post(
      "/admin/clear-cache",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request, res: Response) => {
        return UserController.clearCache(req, res);
      },
    );
    this.router.get(
      "/admin/security-check",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request, res: Response) => {
        return UserController.checkSecurity(req, res);
      },
    );
    this.router.get(
      "/admin/reports/:type",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request<{ type: string }>, res: Response) => {
        return UserController.getReport(req, res);
      },
    );
    this.router.post(
      "/admin/doctors/reset-password",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request, res: Response) => {
        return UserController.resetDoctorsPassword(req, res);
      },
    );
    this.router.get(
      "/admin/users",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request, res: Response) => {
        return UserController.getUsersPage(req, res);
      },
    );
    this.router.patch(
      "/admin/users/:id",
      authMiddleware,
      isAdminMiddleware,
      async (req: Request<{ id: string }>, res: Response) => {
        return UserController.updateUserRole(req, res);
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
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
    const result = await AppointmentsService.getByUserIdPage(user.id, page, pageSize);
    return res.status(200).json(result);
  }

  static async getMyPrescriptions(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
    const result = await PrescriptionService.getByPatientUserIdPage(user.id, page, pageSize);
    return res.status(200).json(result);
  }

  static async getMyBalance(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    const balance = Number((user as { balance?: number }).balance ?? 0);
    return res.status(200).json({ balance });
  }

  static async createPrescriptionRenewalRequest(req: Request<{ id: string }> & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    const prescriptionId = Number(req.params.id);
    if (Number.isNaN(prescriptionId)) {
      return res.status(400).json({ message: "Некорректный id назначения" });
    }
    const request = await PrescriptionRenewalRequestService.createRequest(user.id, prescriptionId);
    if (request) {
      return res.status(201).json({ message: "Запрос на продление рецепта отправлен врачу", request });
    }
    return res.status(400).json({
      message: "Не удалось создать запрос. Проверьте, что назначение принадлежит вам и запрос ещё не отправлялся.",
    });
  }

  static async getMyPrescriptionRenewalRequests(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    const list = await PrescriptionRenewalRequestService.getByPatientUserId(user.id);
    return res.status(200).json({ list });
  }

  static async getMyRenewalRequests(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.DOCTOR) {
      return res.status(403).json({ message: "Доступно только врачам" });
    }
    const list = await PrescriptionRenewalRequestService.getByDoctorId(user.id);
    return res.status(200).json({ list });
  }

  static async patchRenewalRequest(req: Request<{ id: string }> & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.DOCTOR) {
      return res.status(403).json({ message: "Доступно только врачам" });
    }
    const requestId = Number(req.params.id);
    const status = req.body?.status;
    if (Number.isNaN(requestId) || (status !== "approved" && status !== "rejected")) {
      return res.status(400).json({ message: "Укажите status: approved или rejected" });
    }
    const ok = await PrescriptionRenewalRequestService.setStatus(requestId, user.id, status);
    if (ok) {
      return res.status(200).json({ message: status === "approved" ? "Запрос одобрен" : "Запрос отклонён" });
    }
    return res.status(404).json({ message: "Запрос не найден или уже обработан" });
  }

  static async getMyTasks(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
    const filterRaw = String(req.query.filter || "");
    const filter: NurseTaskFilter = ["all", "high_priority", "completed"].includes(filterRaw)
      ? (filterRaw as NurseTaskFilter)
      : "all";
    const dateStr = typeof req.query.date === "string" ? req.query.date : "";
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const taskDate = dateStr.length === 10 && dateRegex.test(dateStr) ? dateStr : new Date().toISOString().slice(0, 10);
    const result = await NurseTaskService.getByNurseForDate(user.id, taskDate, page, pageSize, filter);
    return res.status(200).json(result);
  }

  static async createMyTask(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const body = req.body || {};
    const { patientName, description, room, scheduledTime, taskDate, priority, taskType, analysisId } = body;
    if (!patientName || !description || !scheduledTime || !taskDate) {
      return res.status(400).json({
        message: "Укажите patientName, description, scheduledTime, taskDate",
      });
    }
    const record = await NurseTaskService.create(user.id, {
      patientName,
      description,
      room,
      scheduledTime: String(scheduledTime).trim().slice(0, 10),
      taskDate: String(taskDate).trim().slice(0, 10),
      priority: priority === "high" ? "high" : "normal",
      taskType: taskType === "analysis" ? "analysis" : taskType === "operation" ? "operation" : "procedure",
      analysisId: analysisId != null ? Number(analysisId) : null,
    });
    if (record) {
      return res.status(201).json(record);
    }
    return res.status(500).json({ message: "Не удалось создать задачу" });
  }

  static async completeMyTask(req: Request<{ id: string }> & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const taskId = Number(req.params.id);
    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: "Некорректный id задачи" });
    }
    const ok = await NurseTaskService.complete(taskId, user.id);
    if (ok) {
      return res.status(200).json({ message: "Задача отмечена выполненной" });
    }
    return res.status(404).json({ message: "Задача не найдена или уже выполнена" });
  }

  static async setMyTaskNote(req: Request<{ id: string }> & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const taskId = Number(req.params.id);
    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: "Некорректный id задачи" });
    }
    const note = typeof req.body?.note === "string" ? req.body.note : "";
    const ok = await NurseTaskService.setNote(taskId, user.id, note);
    if (ok) {
      return res.status(200).json({ message: "Заметка сохранена" });
    }
    return res.status(404).json({ message: "Задача не найдена" });
  }

  static async getMyShiftStats(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const dateStr = typeof req.query.date === "string" ? req.query.date : "";
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const taskDate =
      dateStr.length === 10 && dateRegex.test(dateStr) ? dateStr : new Date().toISOString().slice(0, 10);
    const stats = await NurseTaskService.getShiftStats(user.id, taskDate);
    return res.status(200).json(stats);
  }

  static async getMyShiftJournal(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const dateStr = typeof req.query.date === "string" ? req.query.date : "";
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const taskDate =
      dateStr.length === 10 && dateRegex.test(dateStr) ? dateStr : new Date().toISOString().slice(0, 10);
    const list = await NurseTaskService.getAllByNurseAndDate(user.id, taskDate);
    return res.status(200).json({ list });
  }

  static async getMyInventory(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const list = await InventoryService.getAll();
    return res.status(200).json({ list });
  }

  static async createInventoryItem(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const { name, quantity, threshold } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Укажите name (название позиции)" });
    }
    const record = await InventoryService.create({
      name: name.trim(),
      quantity: quantity != null ? Number(quantity) : 0,
      threshold: threshold != null ? Number(threshold) : 0,
    });
    if (record) {
      return res.status(201).json(record);
    }
    return res.status(500).json({ message: "Не удалось создать позицию" });
  }

  static async addInventoryQuantity(req: Request<{ id: string }> & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id" });
    }
    const amount = Number(req.body?.amount ?? 10);
    if (!Number.isFinite(amount) || amount < 1) {
      return res.status(400).json({ message: "Укажите amount (число >= 1)" });
    }
    const ok = await InventoryService.addQuantity(id, amount);
    if (ok) {
      return res.status(200).json({ message: "Количество обновлено" });
    }
    return res.status(404).json({ message: "Позиция не найдена" });
  }

  static async updateInventoryItem(req: Request<{ id: string }> & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.NURSE) {
      return res.status(403).json({ message: "Доступно только медсёстрам" });
    }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id" });
    }
    const { name, quantity, threshold } = req.body || {};
    const data: { name?: string; quantity?: number; threshold?: number } = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (quantity !== undefined && Number.isFinite(Number(quantity))) data.quantity = Number(quantity);
    if (threshold !== undefined && Number.isFinite(Number(threshold))) data.threshold = Number(threshold);
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "Укажите name, quantity или threshold" });
    }
    const ok = await InventoryService.update(id, data);
    if (ok) {
      return res.status(200).json({ message: "Позиция обновлена" });
    }
    return res.status(404).json({ message: "Позиция не найдена" });
  }

  static async getMyPatients(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.DOCTOR) {
      return res.status(403).json({ message: "Доступно только врачам" });
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const result = await UserService.getDoctorPatientsPage(user.id, page, pageSize, search);
    return res.status(200).json(result);
  }

  static async getMyVisitsToday(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.DOCTOR) {
      return res.status(403).json({ message: "Доступно только врачам" });
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
    const result = await UserService.getDoctorVisitsToday(user.id, page, pageSize);
    return res.status(200).json(result);
  }

  static async cancelMyVisit(req: Request<{ id: string }> & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.DOCTOR) {
      return res.status(403).json({ message: "Доступно только врачам" });
    }
    const visitId = Number(req.params.id);
    if (Number.isNaN(visitId)) {
      return res.status(400).json({ message: "Некорректный id визита" });
    }
    const ok = await UserService.cancelVisit(visitId, user.id);
    if (ok) {
      return res.status(200).json({ message: "Визит отменён" });
    }
    return res.status(404).json({ message: "Визит не найден или недоступен для отмены" });
  }

  static async createPrescription(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.DOCTOR) {
      return res.status(403).json({ message: "Доступно только врачам" });
    }
    const { pacientId, prescriptionName, prescriptionDosage, prescriptionFrequency, prescriptionTime, description } =
      req.body || {};
    if (
      !pacientId ||
      !prescriptionName ||
      !prescriptionDosage ||
      !prescriptionFrequency ||
      !prescriptionTime ||
      !description
    ) {
      return res.status(400).json({
        message: "Укажите pacientId (id карты), prescriptionName, prescriptionDosage, prescriptionFrequency, prescriptionTime, description",
      });
    }
    const cardId = Number(pacientId);
    if (Number.isNaN(cardId)) {
      return res.status(400).json({ message: "Некорректный pacientId" });
    }
    const record = await PrescriptionService.create(user.id, cardId, {
      prescriptionName,
      prescriptionDosage,
      prescriptionFrequency,
      prescriptionTime,
      description,
    });
    if (record) {
      return res.status(201).json(record);
    }
    return res.status(404).json({ message: "Карта пациента не найдена или недоступна" });
  }

  static async createAnalysis(req: Request & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.DOCTOR) {
      return res.status(403).json({ message: "Доступно только врачам" });
    }
    const { pacientId, type, text, assignedDate, costs } = req.body || {};
    if (!pacientId || !type || !assignedDate) {
      return res.status(400).json({
        message: "Укажите pacientId (id карты), type, assignedDate (YYYY-MM-DD)",
      });
    }
    const cardId = Number(pacientId);
    if (Number.isNaN(cardId)) {
      return res.status(400).json({ message: "Некорректный pacientId" });
    }
    const record = await AnalysisService.createForDoctor(user.id, cardId, {
      type,
      text,
      assignedDate,
      costs,
    });
    if (record) {
      return res.status(201).json(record);
    }
    return res.status(404).json({ message: "Карта пациента не найдена или недоступна" });
  }

  static async getCardPrescriptions(req: Request<{ cardId: string }> & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.DOCTOR) {
      return res.status(403).json({ message: "Доступно только врачам" });
    }
    const cardId = Number(req.params.cardId);
    if (Number.isNaN(cardId)) {
      return res.status(400).json({ message: "Некорректный cardId" });
    }
    const list = await PrescriptionService.getByCardIdForDoctor(cardId, user.id);
    return res.status(200).json({ list });
  }

  static async getCardAnalyses(req: Request<{ cardId: string }> & JwtPayload, res: Response) {
    const email = req?.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const user = await UserService.getUserByEmail(email);
    if (!user?.id) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    if ((user as { userType?: string }).userType !== UserTypes.DOCTOR) {
      return res.status(403).json({ message: "Доступно только врачам" });
    }
    const cardId = Number(req.params.cardId);
    if (Number.isNaN(cardId)) {
      return res.status(400).json({ message: "Некорректный cardId" });
    }
    const list = await AnalysisService.getByCardIdForDoctor(cardId, user.id);
    return res.status(200).json({ list });
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
    const doctorId = Number(req.body?.doctorId);
    if (!Number.isNaN(doctorId) && (user as { userType?: string }).userType === UserTypes.DOCTOR && user.id === doctorId) {
      return res.status(400).json({ message: "Врач не может записаться к самому себе на приём, консультацию или услугу." });
    }
    const record = await AppointmentsService.create(user.id, req.body);
    if (record) {
      const isService = req.body?.bookingType === "service";
      await ActivityService.log(
        isService
          ? "Пользователь записался на услугу"
          : "Пользователь записался на консультацию",
        user.id,
      ).catch(() => {});
      return res.status(201).json(record);
    }
    return res.status(400).json({
      message: "Не удалось создать приём. Проверьте, что указан существующий id доктора.",
    });
  }

  static async createDoctor(req: CreateDoctorRequest & JwtPayload, res: Response) {
    const body = req.body;
    const newDoctor = await UserService.createDoctor(body);

    if (newDoctor) {
      const actor = req.token?.email
        ? await UserService.getUserByEmail(req.token.email)
        : null;
      await ActivityService.log("Добавлен новый сотрудник", actor?.id ?? null).catch(() => {});
      const { password: _, ...rest } = newDoctor;
      return res.status(201).json(rest);
    }

    return res.status(400).json({
      message: "Не удалось создать доктора (возможно, email уже занят)",
    });
  }

  static async updateDoctor(req: UpdateDoctorRequest & JwtPayload, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id доктора" });
    }

    const updated = await UserService.updateDoctor(id, req.body);

    if (updated) {
      const actor = req.token?.email
        ? await UserService.getUserByEmail(req.token.email)
        : null;
      await ActivityService.log("Обновлены данные врача", actor?.id ?? null).catch(() => {});
      return res.status(200).json(updated);
    }

    return res.status(404).json({
      message: "Доктор не найден",
    });
  }

  static async deleteDoctor(req: DoctorIdParamsRequest & JwtPayload, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id доктора" });
    }

    const deleted = await UserService.deleteDoctor(id);

    if (deleted) {
      const actor = req.token?.email
        ? await UserService.getUserByEmail(req.token.email)
        : null;
      await ActivityService.log("Удалён сотрудник (врач)", actor?.id ?? null).catch(() => {});
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

  static async getAdminStats(res: Response) {
    const stats = await UserService.getAdminStats();
    return res.status(200).json(stats);
  }

  static async getPendingApproval(req: Request, res: Response) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 3));
    const result = await UserService.getPendingApprovalUsers(page, pageSize);
    return res.status(200).json(result);
  }

  static async approveUser(req: Request<{ id: string }> & JwtPayload, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id пользователя" });
    }
    const ok = await UserService.approveUser(id);
    if (ok) {
      const actor = req.token?.email
        ? await UserService.getUserByEmail(req.token.email)
        : null;
      await ActivityService.log("Утверждена регистрация пользователя", actor?.id ?? null).catch(() => {});
      return res.status(200).json({ message: "Пользователь утверждён" });
    }
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  static async rejectUser(req: Request<{ id: string }> & JwtPayload, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id пользователя" });
    }
    const ok = await UserService.rejectUser(id);
    if (ok) {
      const actor = req.token?.email
        ? await UserService.getUserByEmail(req.token.email)
        : null;
      await ActivityService.log("Отклонена регистрация пользователя", actor?.id ?? null).catch(() => {});
      return res.status(200).json({ message: "Регистрация отклонена" });
    }
    return res.status(404).json({ message: "Пользователь не найден или уже утверждён" });
  }

  static async getActivities(req: Request, res: Response) {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    if (req.query.page !== undefined || req.query.pageSize !== undefined) {
      const result = await ActivityService.getList(page, pageSize);
      return res.status(200).json(result);
    }
    const list = await ActivityService.getRecent(limit);
    return res.status(200).json(list);
  }

  static async backupSystem(req: Request & JwtPayload, res: Response) {
    const result = await UserService.backupSystem();
    const actor = req.token?.email
      ? await UserService.getUserByEmail(req.token.email)
      : null;
    await ActivityService.log("Запущено резервное копирование системы", actor?.id ?? null).catch(() => {});
    return res.status(200).json(result);
  }

  static async clearCache(req: Request & JwtPayload, res: Response) {
    const result = await UserService.clearCache();
    const actor = req.token?.email
      ? await UserService.getUserByEmail(req.token.email)
      : null;
    await ActivityService.log("Очистка кэша системы", actor?.id ?? null).catch(() => {});
    return res.status(200).json(result);
  }

  static async checkSecurity(req: Request & JwtPayload, res: Response) {
    const result = await UserService.checkSecurity();
    const actor = req.token?.email
      ? await UserService.getUserByEmail(req.token.email)
      : null;
    await ActivityService.log("Проверка безопасности системы", actor?.id ?? null).catch(() => {});
    return res.status(200).json(result);
  }

  static async getReport(req: Request<{ type: string }> & JwtPayload, res: Response) {
    const type = req.params.type as "financial" | "medical" | "users";
    if (!["financial", "medical", "users"].includes(type)) {
      return res.status(400).json({ message: "Недопустимый тип отчёта" });
    }
    const result = await UserService.getReport(type);
    const actor = req.token?.email
      ? await UserService.getUserByEmail(req.token.email)
      : null;
    const reportLabels: Record<string, string> = {
      financial: "Финансовый отчёт",
      medical: "Медицинский отчёт",
      users: "Отчёт по пользователям",
    };
    await ActivityService.log(
      `Сформирован отчёт: ${reportLabels[type] ?? type}`,
      actor?.id ?? null,
    ).catch(() => {});
    return res.status(200).json(result);
  }

  static async resetDoctorsPassword(req: Request & JwtPayload, res: Response) {
    const { new_password } = req.body;
    if (!new_password || typeof new_password !== "string") {
      return res.status(400).json({ message: "Укажите new_password" });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ message: "Пароль должен быть не менее 6 символов" });
    }
    const { updated } = await UserService.resetDoctorsPassword(new_password);
    const actor = req.token?.email
      ? await UserService.getUserByEmail(req.token.email)
      : null;
    await ActivityService.log(
      `Сброс паролей врачей (установлен для ${updated} врачей)`,
      actor?.id ?? null,
    ).catch(() => {});
    return res.status(200).json({ message: `Пароль установлен для ${updated} врачей`, updated });
  }

  static async getUsersPage(req: Request, res: Response) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const result = await UserService.getUsersPage(page, pageSize);
    return res.status(200).json(result);
  }

  static async updateUserRole(req: Request<{ id: string }>, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id пользователя" });
    }
    const { isAdmin, userType } = req.body as { isAdmin?: boolean; userType?: string };
    const updates: { isAdmin?: boolean; userType?: UserTypes } = {};
    if (typeof isAdmin === "boolean") updates.isAdmin = isAdmin;
    if (typeof userType === "string" && ["pacient", "admin", "doctor", "nurse"].includes(userType)) {
      updates.userType = userType as UserTypes;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Укажите isAdmin и/или userType" });
    }
    const ok = await UserService.updateUserRole(id, updates);
    if (ok) {
      return res.status(200).json({ message: "Права пользователя обновлены" });
    }
    return res.status(404).json({ message: "Пользователь не найден" });
  }
}

export const userController = new UserController();
