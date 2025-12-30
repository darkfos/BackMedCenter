import { Router, Request, Response } from "express";

import { authMiddleware } from "@/utils/middlewares/authMiddleware.js";
import {UserService} from "@/module/users/service/user.service.js";
import {JwtPayload} from "jsonwebtoken";

export const userRouter = Router();


userRouter.get('/info', authMiddleware, async (req: Request & JwtPayload, res: Response) => {
    /*
        #swagger.method = 'GET'
        #swagger.tags = ['Users']
        #swagger.summary = 'Получение информации о пользователе'
        #swagger.description = 'Получение полной информации о пользователе'
        #swagger.produces = ['application/json']
        #swagger.consumes = ['applicaiton/json']

        #swagger.responses[200] = {
            $ref: '#/definitions/User'
        }
        #swagger.responses[400] = {
            description: 'Не удалось получить информацию по пользователю'
            schema: {
                $ref: '#/definitions/Message'
            }
        }
    */

    const user = await UserService.getUserByEmail(req?.token?.email);

    if (user) {
        return res.status(200).json(user);
    }

    return res.status(404).json({
        message: 'Пользователь не найден'
    })
});

userRouter.patch('/update-password', authMiddleware, async (req: Request & JwtPayload, res: Response) => {
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

    const { new_password } = req.body;
    const passwordIsUpdated = await UserService.updatePassword(req?.token?.email, new_password);

    if (passwordIsUpdated) {
        return res.status(200).json({
            message: 'Пароль успешно обновлен'
        })
    }

    return res.status(400).json({
        message: 'Не удалось обновить пароль'
    })
})