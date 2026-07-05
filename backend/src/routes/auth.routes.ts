import { Router } from "express";
import { register, login, getMe, logout } from '../controllers/controllers';
import { authenticate } from '../middleware/auth';

const authRouter = Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', authenticate, getMe)
authRouter.post('/logout', logout)

export default authRouter


