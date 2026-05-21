import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_MAX_MB * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon'].includes(file.mimetype)) {
      cb(new HttpError(422, 'Envie uma imagem JPG, PNG, WEBP, SVG ou ICO.'));
      return;
    }
    cb(null, true);
  }
});

export const uploadPngImage = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_MAX_MB * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'image/png') {
      cb(new HttpError(422, 'Envie um arquivo PNG.'));
      return;
    }
    cb(null, true);
  }
});
