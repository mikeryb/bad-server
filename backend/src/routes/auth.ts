import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import csrf from 'csurf'

const csrfProtection = csrf({ cookie: true })

const authRouter = Router()

authRouter.get('/user', auth, getCurrentUser)
authRouter.get('/csrf-token', csrfProtection, (req, res) => {
    res.send(req.csrfToken())
})
authRouter.patch('/me', auth, csrfProtection, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)
authRouter.post('/register', register)

export default authRouter
