import { Router } from "express";
import type { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserService } from "@/module/users";

import { AnalysisService } from "@/module/analysis/service/AnalysisService";
import { Analysis } from "@/module/analysis/dto/Analysis.dto";
import { authMiddleware } from "@/utils";
import { isAdminMiddleware } from "@/utils/middlewares/adminMiddleware";

class AnalysController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get("/list", isAdminMiddleware, AnalysController.allAnalysis);
    this.router.get("/my", authMiddleware, AnalysController.myAnalysis);
    this.router.post("/create", authMiddleware, isAdminMiddleware, AnalysController.createAnalysis);
  }

  static async allAnalysis(req: Request, res: Response) {
    /*
      #swagger.method = 'GET'
      #swagger.tags = ['Analysis']
      #swagger.summary = 'Получение списка анализов'
      #swagger.description = 'Получение списка всех анализов с количеством'
      #swagger.produces = ['application/json']
      #swagger.consumes = ['application/json']

      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Фильтры для получения анализов',
        required: false,
        schema: {
          $ref: "#/definitions/AnalysFilters"
        }
      }

      #swagger.responses[200] = {
        schema: {
          $ref: '#/definitions/AnalysisList'
        }
      }
    */

    const filters: Pick<Analysis, "type" | "costs" | "status"> = req.body;
    const allAnalysis = await AnalysisService.getList(filters);
    return res
      .status(200)
      .json({ list: allAnalysis[0], totalCount: allAnalysis[1] });
  }

  static async myAnalysis(req: Request & JwtPayload, res: Response) {

    const user = await UserService.getUserByEmail(req.token.email);
    const myAnalysis = await AnalysisService.getList({pacient: user.id});

    return res.status(200).json({ list: myAnalysis[0], totalCount: myAnalysis[1] });
  }

  static async createAnalysis(req: Request, res: Response) {
    /*

    */
  }
}

export const analysisController = new AnalysController();
