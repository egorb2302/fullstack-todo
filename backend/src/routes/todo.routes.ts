import { Router } from "express";
import { DELETETODO, GETTODOS, GETTODO, POSTTODO, PATCHTODO, routes } from '../controllers/controllers'
import { cache } from '../middleware/cache';
import { validate } from '../middleware/validation';
import { createSchema, paramsSchema, taskSchema } from '../schemas/todoSchemas';

const todoRouter = Router();

todoRouter.get('/routes', routes)
todoRouter.get('/', cache(), GETTODOS)
todoRouter.get('/:id', cache() ,validate(paramsSchema, "params"), GETTODO)
todoRouter.post('/', validate(createSchema, "body"), POSTTODO)
todoRouter.delete('/:id', validate(paramsSchema, "params"), DELETETODO)
todoRouter.patch('/:id', validate(paramsSchema, "params"), validate(taskSchema, "body"), PATCHTODO)

export default todoRouter
