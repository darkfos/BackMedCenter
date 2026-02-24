import { Router } from "express";
import type { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserService } from "@/module/users";

import { AnalysisService } from "@/module/analysis/service/AnalysisService";
import { Analysis } from "@/module/analysis/dto/Analysis.dto";
import { authMiddleware } from "@/utils/middlewares/authMiddleware.js";
import { isAdminMiddleware } from "@/utils/middlewares/adminMiddleware.js";

class AnalysController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get(
      "/list",
      isAdminMiddleware,
      (req: Request, res: Response) => {
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

        return AnalysController.allAnalysis(req, res);
      },
    );
    this.router.get("/my", authMiddleware, (req: Request, res: Response) => {
      /*
       #swagger.method = 'GET'
       #swagger.tags = ['Analysis']
       #swagger.summary = 'Получение списка анализов пользователя'
       #swagger.description = 'Получение списка всех анализов пользователя с количеством'
       #swagger.produces = ['application/json']
       #swagger.consumes = ['application/json']

       #swagger.responses[200] = {
         schema: {
           $ref: '#/definitions/AnalysisList'
         }
       }
    */
      return AnalysController.myAnalysis(req, res);
    });
    this.router.post(
      "/create",
      authMiddleware,
      isAdminMiddleware,
      (req: Request, res: Response) => {
        /*
          #swagger.method = 'POST'
          #swagger.tags = ['Analysis']
          #swagger.summary = 'Создания анализа'
          #swagger.description = 'Создание анализа для пациента'

          #swagger.produces = ['application/json']
          #swagger.consumes = ['application/json']
        */
        return AnalysController.createAnalysis(req, res);
      },
    );
  }

  static async allAnalysis(req: Request, res: Response) {
    const filters: Pick<Analysis, "type" | "costs" | "status"> = req.body;
    const allAnalysis = await AnalysisService.getList(filters);
    return res
      .status(200)
      .json({ list: allAnalysis[0], totalCount: allAnalysis[1] });
  }

  static async myAnalysis(req: Request & JwtPayload, res: Response) {
    const user = await UserService.getUserByEmail(req.token.email);
    const myAnalysis = await AnalysisService.getList({ pacient: user.id });

    return res
      .status(200)
      .json({ list: myAnalysis[0], totalCount: myAnalysis[1] });
  }

  static async createAnalysis(req: Request, res: Response) {}
}

export const analysisController = new AnalysController();
