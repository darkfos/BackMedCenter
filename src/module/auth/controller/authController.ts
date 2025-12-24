import { Router, type Request, type Response } from "express";

import { UserService } from '@/module/users/service/user.service.js';
import { RegUserInfo } from "@/module/auth/dto/Auth.dto.js";

export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
    /*
      #swagger.tags = ['Auth']
      #swagger.summary = 'Регистрация пользователя'
      #swagger.description = 'Регистрация пользователя'
      #swagger.method = 'post'
      #swagger.produces = ['application/json']
      #swagger.consumes = ['application/json']

      #swagger.parameters['body'] = {
          in: 'body',
          description: 'Пользовательские данные для регистрации',
          required: true,
          schema: {
             $ref: '#/definitions/RegUserData'
          }
      }

      #swagger.responses[201] = {
          description: 'Пользователь был зарегистрирован',
          schema: { $ref: '#/definitions/AuthReg' }
      }
      #swagger.responses[400] = {
          description: 'Не удалось зарегистрировать пользователя',
          schema: { $ref: '#/definitions/AuthReg' }
      }
     */

    const userData: RegUserInfo = req.body;
    const newUser = await UserService.createUser(userData);
    if (newUser) {
        return res.status(201).json({'message': 'Пользователь был зарегистрирован'});
    }
});