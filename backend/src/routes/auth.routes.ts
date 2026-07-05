import { Router } from "express";
import { register, login, getMe, logout, refresh } from '../controllers/controllers';
import { authenticate } from '../middleware/auth';

const authRouter = Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh', refresh)
authRouter.get('/me', authenticate, getMe)
authRouter.post('/logout', logout)

export default authRouter


