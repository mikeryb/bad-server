import csrf from 'csurf'
import { Router } from 'express'
import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from '../controllers/products'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import {
    validateObjId,
    validateProductBody,
    validateProductUpdateBody,
} from '../middlewares/validations'
import { Role } from '../models/user'


const csrfProtection = csrf({ cookie: true })

const productRouter = Router()

productRouter.get('/', getProducts)
productRouter.post(
    '/',
    auth,
    csrfProtection,
    roleGuardMiddleware(Role.Admin),
    validateProductBody,
    createProduct
)
productRouter.delete(
    '/:productId',
    auth,
    csrfProtection,
    roleGuardMiddleware(Role.Admin),
    validateObjId,
    deleteProduct
)
productRouter.patch(
    '/:productId',
    auth,
    csrfProtection,
    roleGuardMiddleware(Role.Admin),
    validateObjId,
    validateProductUpdateBody,
    updateProduct
)

export default productRouter
