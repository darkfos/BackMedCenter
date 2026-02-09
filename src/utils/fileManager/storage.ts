import multer from "multer";
import { Request } from "express";
import { join } from "node:path";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, "../../", "public/images/"));
  },
  filename(
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const iconsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, "../../", "public/icons"));
  },
  filename(
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

export const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(null, false);
  },
}).single("image");

export const uploadIcons = multer({
  storage: iconsStorage,
  limits: {
    fileSize: 1024 * 1024 * 8,
  },
  fileFilter: (req, file, cb) => {
    if (
      ["image/svg+xml", "image/jpeg", "image/png", "image/jpg"].includes(
        file.mimetype,
      )
    ) {
      return cb(null, true);
    }

    cb(null, false);
  },
}).single("icon");
