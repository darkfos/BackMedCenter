import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { verifyToken, generateToken } from "@/utils/other/jwt.js";
import { UserService } from "@/module/users";

type PayloadWithEmail = JwtPayload & { email?: string };

function hasEmail(p: unknown): p is PayloadWithEmail {
  return typeof p === "object" && p !== null && "email" in p;
}

export async function authMiddleware(
  req: Request & JwtPayload,
  res: Response,
  next: NextFunction,
) {
  const accessToken = (req.headers?.authorization ?? "").split("Bearer ")[1] as string;
  const accessPayload = accessToken ? await verifyToken(accessToken, "access") : null;
  let userData: PayloadWithEmail | null = hasEmail(accessPayload) ? accessPayload : null;

  if (!userData) {
    const refreshPayload = await verifyToken(
      (req.headers?.refresh as string) ?? "",
      "refresh",
    );
    if (hasEmail(refreshPayload) && refreshPayload.email) {
      const payload = { email: refreshPayload.email };
      const newToken = generateToken(payload, "access");
      res.set({ token: newToken });
      req.token = payload;
      userData = payload as PayloadWithEmail;
    }
  } else {
    req.token = userData;
  }

  const email = userData?.email;
  if (!email) {
    return res
      .status(401)
      .send({ message: "Не удалось аутентифицировать пользователя" });
  }

  const user = await UserService.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Пользователь не найден" });
  }
  if ((user as { isConfirmed?: boolean }).isConfirmed !== true) {
    return res.status(401).json({ message: "Пользователь не подтвержден" });
  }

  return next();
}

export async function postAuthMiddleware(
  req: Request & JwtPayload,
  res: Response,
  next: NextFunction,
) {
  // POST Middleware
  return next();
}
