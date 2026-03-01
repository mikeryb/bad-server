import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import sanitizeHtml from 'sanitize-html'
import sharp from 'sharp'
import crypto from 'crypto'
import path from 'path'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    try {
        const fileSize = req.file.size
        if (fileSize < 2 * 1024) {
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

        const ext = path.extname(req.file.originalname).toLowerCase()
        const randomName = crypto.randomBytes(16).toString('hex') + ext

        const fileName = randomName

        return res.status(constants.HTTP_STATUS_CREATED).json({
            fileName,
            originalName: randomName,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
