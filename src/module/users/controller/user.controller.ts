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