import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        const safeFilename = req.file.filename.replace(/[^a-zA-Z0-9_\-\.]/g, '')
        const safeOriginalName = String(sanitizeHtml(req.file.originalname, {
            allowedTags: [],
            allowedAttributes: {},
            allowedSchemes: [],
        })).slice(0, 100)
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${safeFilename}`
            : `/${safeFilename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: safeOriginalName,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
function sanitizeHtml(
    originalname: string,
    arg1: {
        allowedTags: never[]
        allowedAttributes: {}
        allowedSchemes: never[]
    }
) {
    throw new Error('Function not implemented.')
}
