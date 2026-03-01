import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";

export const validateBodyDTOMiddleware = (ValidateSchema: new () => object) => {
  return async (req: Request & JwtPayload, res: Response, next: NextFunction) => {
    try {
      const body = req.body ?? {};
      const schema = plainToInstance(ValidateSchema, body, {
        enableImplicitConversion: true,
      });

      await validateOrReject(schema, {
        forbidUnknownValues: false,
        skipMissingProperties: false,
      });

      req.body = schema;
      next();
    } catch (errors) {
      const list = Array.isArray(errors) ? errors : [errors];
      const messages = list.map((e: { property?: string; constraints?: Record<string, string> }) => ({
        field: e.property,
        errors: e.constraints ? Object.values(e.constraints) : [],
      }));
      res.status(400).json({
        detail: messages.length > 0 ? messages : "Не переданы параметры",
      });
    }
  }
}

export const validateQueryDTOMiddleware = (ValidateSchema: any) => {

  return async (req: Request & JwtPayload, res: Response, next: NextFunction) => {

    try {
      const schema = new ValidateSchema();
      const params = req.query;

      Object.keys(schema).forEach(key => {
        schema[key] = params[key];
      });

      await validateOrReject(schema);

      next();
    } catch (errors) {
      console.log(errors);
      res.status(400).json({ detail: Object.keys(errors as object).length ? errors : 'Не переданы параметры' })
    }
  }
}