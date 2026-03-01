import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import sharp from 'sharp'
import crypto from 'crypto'
import path from 'path'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('req.file:', req.file);
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }



    try {
        const fileSize = req.file.size
        if (fileSize <= 2 * 1024) {
            return next(new BadRequestError('Файл слишком маленький'))
        }
        if (fileSize > 10 * 1024 * 1024) {
            return next(new BadRequestError('Файл слишком большой'))
        }

        try {
            await sharp(req.file.buffer).metadata()
        } catch {
            return next(new BadRequestError('Файл не является изображением'))
        }

        const originalName = path.basename(req.file.originalname)

        const fileName =
            `/${process.env.UPLOAD_PATH ?? ''}/${req.file.filename}`.replace(
                /\/+/g,
                '/'
            )

        return res.status(constants.HTTP_STATUS_CREATED).json({
            fileName,
            originalName
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
