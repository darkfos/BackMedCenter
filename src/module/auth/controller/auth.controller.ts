import { Router, type Request, type Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

import { uploadImage } from "@/utils/fileManager/storage.js";
import { authMiddleware } from "@/utils/middlewares/authMiddleware.js";
import { UserService } from "@/module/users";
import { RegUserInfo } from "@/module/auth";
import { AuthService } from "@/module/auth";

class AuthController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.post("/register", uploadImage, (req, res) => {
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
            schema: { $ref: '#/definitions/Message' }
        }
        #swagger.responses[400] = {
            description: 'Не удалось зарегистрировать пользователя',
            schema: { $ref: '#/definitions/Message' }
        }
      */

      return AuthController.register(req, res);
    });
    this.router.post("/login", (req, res) => {
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

          #swagger.responses[200] = {
            description: 'Пользователь был успешно авторизован',
            schema: { $refs: '#/definitions/TokensData' }
          }
          #swagger.responses[401] = {
            description: 'Не удалось аутентифицировать пользователя',
            schema: { $refs: '#/definitions/Message' }
          }
      */

      return AuthController.login(req, res);
    });
    this.router.patch("/change-password", authMiddleware, (req, res) => {
      /*
        #swagger.tags = ['Auth']
        #swagger.summary = 'Смена пароля'
        #swagger.description = 'Смена пароля авторизованного пользователя'
        #swagger.parameters['body'] = { in: 'body', required: true, schema: { new_password: 'string' } }
        #swagger.responses[200] = { description: 'Пароль успешно изменён', schema: { $ref: '#/definitions/Message' } }
        #swagger.responses[400] = { description: 'Не удалось изменить пароль', schema: { $ref: '#/definitions/Message' } }
        #swagger.responses[401] = { description: 'Требуется авторизация', schema: { $ref: '#/definitions/Message' } }
      */
      return AuthController.changePassword(req, res);
    });
    this.router.post("/me", (req, res) => {
      /*
        #swagger.method = 'Post'
        #swagger.tags = ['Auth']
        #swagger.summary = 'Проверка аутентифицированного пользователя'
        #swagger.description = 'Проверка аутентифицированного пользователя путем декодирования токена'
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.responses[200] = {
          description: 'Пользователь был аутентифицирован',
          schema: { $refs: '#/definitions/VerifyUser' }
        }
        #swagger.responses[401] = {
          description: 'Пользователь не прошел аутентификацию',
          schema: { $refs: '#/definitions/VerifyUser' }
        }
      */

      return AuthController.me(req, res);
    });
  }

  static async register(req: Request, res: Response) {
    const userData: RegUserInfo = {
      ...req.body,
      avatar: req.file?.filename ?? "",
    };

    const newUser = await UserService.createUser(userData);
    if (newUser) {
      return res
        .status(201)
        .json({ message: "Пользователь был зарегистрирован" });
    }
  }

  static async login(req: Request, res: Response) {
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
  }

  static me(req: Request, res: Response) {
    const verifyUser = AuthService.verifyMe(
      (req.headers.authorization ?? "")?.split("Bearer ")[1] ?? "",
    );
    if (verifyUser) {
      return res.status(200).json({
        message: "Пользователь был аутентифицирован",
      });
    }

    return res.status(401).json({
      message: "Пользователь не прошел аутентификацию",
    });
  }

  static async changePassword(req: Request & { token?: JwtPayload }, res: Response) {
    const email = req.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    const { new_password } = req.body;
    const updated = await AuthService.changePassword(email, new_password);
    if (updated) {
      return res.status(200).json({ message: "Пароль успешно изменён" });
    }
    return res.status(400).json({ message: "Не удалось изменить пароль" });
  }
}

export const authController = new AuthController();
