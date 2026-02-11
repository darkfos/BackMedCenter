import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserService } from "@/module/users";

export async function isAdminMiddleware(
  req: Request & JwtPayload,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await UserService.getUserByEmail(req.token.email);
    if (user.isAdmin) {
      return next();
    }

    throw new Error("Не администратор");
  } catch {
    return res
      .status(401)
      .send({ message: "Действие разрешено только администраторам" });
  }
}
