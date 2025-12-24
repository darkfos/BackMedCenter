import { Router, type Request, type Response } from "express";

import { UserService } from "@/module/users/service/user.service.js";
import { RegUserInfo } from "@/module/auth/dto/Auth.dto.js";
import { AuthService } from "@/module/auth/service/AuthService.js";

export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
  /*
      #swagger.method = 'post'
      #swagger.tags = ['Auth']
      #swagger.summary = 'Регистрация пользователя'
      #swagger.description = 'Регистрация пользователя'
      #swagger.produces = ['application/json']
      #swagger.consumes = ['application/json']

      #swagger.parameters['body'] = {
          in: 'body',
          description: 'Пользовательские данные для регистрации',
          required: true,
          schema: {
             $ref: '#/definitions/AuthUserData'
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
    return res
      .status(201)
      .json({ message: "Пользователь был зарегистрирован" });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  /*
        #swagger.method = 'POST'
        #swagger.tags = ['Auth']
        #swagger.summary = 'Авторизация пользователя'
        #swagger.description = 'Авторизация пользователя с получением токенов'
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Пользовательские данные для авторизации',
            required: true,
            schema: {
                $ref: '#/definitions/AuthUserData'
            }
        }
    */

  const userData: RegUserInfo = req.body;
  const [accessToken, refreshToken] = await AuthService.login(userData);

  if (accessToken && refreshToken) {
    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  }

  res.status(401).send({
    message: "Не удалось аутентифицировать пользователя",
  });
});
