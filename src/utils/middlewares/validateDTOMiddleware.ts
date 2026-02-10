import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { validateOrReject } from "class-validator";

export const validateBodyDTOMiddleware = (ValidateSchema: any) => {

  return async (req: Request & JwtPayload, res: Response, next: NextFunction) => {

    try {
      const schema = new ValidateSchema();
      const body = req.body;

      Object.keys(schema).forEach(key => {
        schema[key] = body[key];
      });

      await validateOrReject(schema);

      next();
    } catch (errors) {
      res.status(400).json({ detail: errors })
    }
  }
}