import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { Error as MongooseError } from 'mongoose'
import { join } from 'path'
import BadRequestError from '../errors/bad-request-error'
import ConflictError from '../errors/conflict-error'
import NotFoundError from '../errors/not-found-error'
import Product, { IProduct } from '../models/product'
import movingFile from '../utils/movingFile'
import sanitizeHtml from 'sanitize-html';

// GET /product
const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 5 } = req.query
        const pageNum = Math.max(1, Number(page) || 1)
        const limitNum = Math.min(50, Math.max(1, Number(limit) || 5))

        const options = {
            skip: (pageNum - 1) * limitNum,
            limit: limitNum,
        }
        const products = await Product.find({}, null, options)
        const totalProducts = await Product.countDocuments({})
        const totalPages = Math.ceil(totalProducts / Number(limit))
        return res.send({
            items: products,
            pagination: {
                totalProducts,
                totalPages,
                currentPage: pageNum,
                pageSize: limitNum,
            },
        })
    } catch (err) {
        return next(err)
    }
}

// POST /product
const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { description, category, price, title, image } = req.body

        const safeTitle = sanitizeHtml(title, {
            allowedTags: [],
            allowedAttributes: {},
        })
        const safeDescription = sanitizeHtml(description, {
            allowedTags: [],
            allowedAttributes: {},
        })
        const safeCategory = sanitizeHtml(category, {
            allowedTags: [],
            allowedAttributes: {},
        })
        const safePrice = Number(price)
        if (isNaN(safePrice) || safePrice < 0) {
            throw new BadRequestError('Неверное значение price')
        }

        // Переносим картинку из временной папки
        if (image) {
            movingFile(
                image.fileName,
                join(__dirname, `../public/${process.env.UPLOAD_PATH_TEMP}`),
                join(__dirname, `../public/${process.env.UPLOAD_PATH}`)
            )
        }

        const product = await Product.create({
            description: safeDescription,
            image,
            category: safeCategory,
            price: safePrice,
            title: safeTitle,
        })
        return res.status(constants.HTTP_STATUS_CREATED).send(product)
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) {
            return next(new BadRequestError(error.message))
        }
        if (error instanceof Error && error.message.includes('E11000')) {
            return next(
                new ConflictError('Товар с таким заголовком уже существует')
            )
        }
        return next(error)
    }
}

// TODO: Добавить guard admin
// PUT /product
const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params
        const { title, description, category, price, image } = req.body
        const updateData: Partial<IProduct> = {}
        if (title)
            updateData.title = String(
                sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} })
            )
        if (description)
            updateData.description = String(
                sanitizeHtml(description, {
                    allowedTags: [],
                    allowedAttributes: {},
                })
            )
        if (category)
            updateData.category = String(
                sanitizeHtml(category, {
                    allowedTags: [],
                    allowedAttributes: {},
                })
            )

        if (price !== undefined) {
            const safePrice = Number(price)
            if (isNaN(safePrice) || safePrice < 0)
                throw new BadRequestError('Неверное значение price')
            updateData.price = safePrice
        }

        if (image) updateData.image = image

        // Переносим картинку из временной папки
        if (image) {
            movingFile(
                image.fileName,
                join(__dirname, `../public/${process.env.UPLOAD_PATH_TEMP}`),
                join(__dirname, `../public/${process.env.UPLOAD_PATH}`)
            )
        }

        const product = await Product.findByIdAndUpdate(productId, updateData, {
            runValidators: true,
            new: true,
        }).orFail(() => new NotFoundError('Нет товара по заданному id'))
        return res.send(product)
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) {
            return next(new BadRequestError(error.message))
        }
        if (error instanceof MongooseError.CastError) {
            return next(new BadRequestError('Передан не валидный ID товара'))
        }
        if (error instanceof Error && error.message.includes('E11000')) {
            return next(
                new ConflictError('Товар с таким заголовком уже существует')
            )
        }
        return next(error)
    }
}

// TODO: Добавить guard admin
// DELETE /product
const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params
        const product = await Product.findByIdAndDelete(productId).orFail(
            () => new NotFoundError('Нет товара по заданному id')
        )
        return res.send(product)
    } catch (error) {
        if (error instanceof MongooseError.CastError) {
            return next(new BadRequestError('Передан не валидный ID товара'))
        }
        return next(error)
    }
}

export { createProduct, deleteProduct, getProducts, updateProduct }
