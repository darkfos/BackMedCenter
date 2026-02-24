import { Router, Request, Response } from "express";
import { authMiddleware } from "@/utils/middlewares/authMiddleware.js";
import { validateBodyDTOMiddleware } from "@/utils/middlewares/validateDTOMiddleware.js";
import { MedicalHistoryService } from "@/module/pacients/service/MedicalHistory.service.js";
import { CreateMedicalHistoryDTO } from "@/module/pacients/dto/CreateMedicalHistory.dto.js";

class PacientsController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get(
      "/:id/history",
      authMiddleware,
      (req: Request<{ id: string }>, res: Response) => {
        return PacientsController.getMedicalHistory(req, res);
      },
    );
    this.router.post(
      "/:id/history",
      authMiddleware,
      validateBodyDTOMiddleware(CreateMedicalHistoryDTO),
      (req: Request<{ id: string }>, res: Response) => {
        return PacientsController.createMedicalHistory(req, res);
      },
    );
  }

  static async getMedicalHistory(req: Request<{ id: string }>, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id карты пациента" });
    }
    const list = await MedicalHistoryService.getByPacientId(id);
    return res.status(200).json(list);
  }

  static async createMedicalHistory(req: Request<{ id: string }>, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Некорректный id карты пациента" });
    }
    const record = await MedicalHistoryService.create(id, req.body);
    if (record) {
      return res.status(201).json(record);
    }
    return res.status(400).json({
      message: "Не удалось создать запись. Проверьте id карты и id доктора.",
    });
  }
}

export const pacientsController = new PacientsController();
