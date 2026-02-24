import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserService } from "@/module/users";

export async function isAdminMiddleware(
  req: Request & JwtPayload,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.token?.email;
    if (!email) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }

    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    if (user.isAdmin !== true) {
      return res.status(403).json({ message: "Действие разрешено только администраторам" });
    }

    return next();
  } catch {
    return res.status(403).json({ message: "Действие разрешено только администраторам" });
  }
}
