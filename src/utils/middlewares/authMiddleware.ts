import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { verifyToken, generateToken } from "@/utils/other/jwt.js";
import { UserService } from "@/module/users";

export async function authMiddleware(
  req: Request & JwtPayload,
  res: Response,
  next: NextFunction,
) {

  const user = await UserService.getUserByEmail(req.token.email);

  const userData = await verifyToken(
    (req.headers?.authorization ?? "").split("Bearer ")[1] as string,
    "access",
  );

  if (user.isConfirmed !== true) {
    return res.status(401).json({ message: "Пользователь не подтвержден" });
  }

  if (userData) {
    req.token = userData;
    return next();
  }

  if (!userData) {
    const userRefreshData = await verifyToken(
      (req.headers?.refresh as string) ?? "",
      "refresh",
    );

    if (userRefreshData) {
      const payload = { email: (userRefreshData as JwtPayload)?.email };
      const newToken = generateToken(payload, "access");

      res.set({ token: newToken });
      req.token = payload;

      return next();
    }
  }

  return res
    .status(401)
    .send({ message: "Не удалось аутентифицировать пользователя" });
}

export async function postAuthMiddleware(
  req: Request & JwtPayload,
  res: Response,
  next: NextFunction,
) {
  // POST Middleware
  return next();
}
