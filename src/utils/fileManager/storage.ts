import multer from "multer";
import { Request } from "express";
import { join } from "node:path";
import { mkdirSync, existsSync } from "node:fs";

const publicRoot = join(process.cwd(), "public");

const ensureDir = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = join(publicRoot, "images");
    ensureDir(dir);
    cb(null, dir);
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
    const dir = join(publicRoot, "icons");
    ensureDir(dir);
    cb(null, dir);
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
