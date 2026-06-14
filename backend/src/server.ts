import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { ServerTodoType } from './types/types'
import { getDataFromBD, getTodo } from './controllers/controllers'

dotenv.config()
const PORT = process.env.PORT || "5000"
const URL = process.env.URL || "http://localhost:5000"
const app = express()
export const pathToBD = path.resolve(__dirname, "..", "data", "db.json");

app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: [`http://localhost:${PORT}`, 'http://localhost:5173'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json())

app.get('/todos', async (req: Request, res: Response): Promise<void | Response> => {
    if (!req) return res.status(404).json({ error: "Cant get todos data" })

    try {
        res.send(await getDataFromBD())
    } catch (err) {
        console.error(err)
        return
    }
})

app.get(`/todos/:id`, async (req: Request, res: Response): Promise<void | Response> => {
    try {
        const id = Number(req.params.id)
        const todo = await getTodo(id)

        if (!todo) {
            return res.status(404).json({ error: "Cant get todo on server" })
        }

        res.json(todo)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.post('/todos', async (req: Request, res: Response): Promise<void> => {
    try {
        const newTask: ServerTodoType = {
            id: Date.now(),
            title: req.body.title,
            description: req.body.description,
            isCompleted: req.body.isCompleted
        }
        const data = await getDataFromBD()
        await fs.promises.writeFile(pathToBD, JSON.stringify([ ...data, newTask ], null, 2), "utf-8")
        res.status(201).json({ message: "Task adding was successfully", task: newTask})
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Post todo error" })
    }
})

app.delete('/todos/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id)
        const data = await getDataFromBD()
        const filtred = data.filter(t => t.id !== id)
        await fs.promises.writeFile(pathToBD, JSON.stringify(filtred, null, 2), "utf-8")
        res.status(201).json({ message: "Task deleting was successfully" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Delete todo error"})
    }
})

app.patch('/todos/:id', async (req: Request, res: Response): Promise<void | Response> => {
    try {
        const id = Number(req.params.id)
        const data = await getDataFromBD()
        const index = data.findIndex(t => t.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: "Todo not found" });
        }
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }
        
        const current = data[index];
        const updatedTodo = {
            ...current,
            title: req.body.title ?? current.title,
            description: req.body.description ?? current.description,
            isCompleted: req.body.isCompleted ?? current.isCompleted
        };
        data[index] = updatedTodo;
        await fs.promises.writeFile(pathToBD, JSON.stringify(data, null, 2), "utf-8")
        res.status(200).json({ message: "Task patching was successfully", todo: updatedTodo })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Patch todo error"})
    }
})

app.listen(PORT, () => console.log(`Server is running on ${URL}`))
