import { Router } from "express";
import { queue } from "../controllers/controllers";

const queueRouter = Router();

queueRouter.get('/stats', queue)

export default queueRouter

