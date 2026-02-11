import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { verifyToken, generateToken } from "@/utils";

export async function authMiddleware(
  req: Request & JwtPayload,
  res: Response,
  next: NextFunction,
) {
  const userData = await verifyToken(
    (req.headers?.authorization ?? "").split("Bearer ")[1] as string,
    "access",
  );

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
      const newToken = generateToken(
        { email: (userRefreshData as JwtPayload)?.email },
        "access",
      );

      res.set({ token: newToken });
      req.token = newToken;

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
