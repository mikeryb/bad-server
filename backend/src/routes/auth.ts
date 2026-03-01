import csrf from 'csurf'
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


const csrfProtection = csrf({ cookie: true })

const authRouter = Router()

authRouter.get('/user', auth, getCurrentUser)
authRouter.get('/csrf-token', auth, csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})
authRouter.patch('/me', auth, csrfProtection, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', login)
authRouter.get('/token', auth, refreshAccessToken)
authRouter.get('/logout', auth, logout)
authRouter.post('/register', register)

export default authRouter
