import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import cors from 'cors'
import path from 'path'
import fs, { read } from 'fs'
import { ServerTodoType } from './types/types';

dotenv.config()
const PORT = process.env.PORT || "5000"
const URL = process.env.URL || "http://localhost:5000"
const app = express()
const pathToBD = path.resolve(__dirname, "..", "data", "db.json");

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: [`http://localhost:${PORT}`, 'http://localhost:5173'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

const getDataFromBD = async (): Promise<ServerTodoType[]> => {
    const dbData = await fs.promises.readFile(pathToBD, "utf-8")
    const database = await JSON.parse(dbData)
    return database
}

const getTodo = async (id: number): Promise<ServerTodoType | undefined> => {
    const data = await getDataFromBD()
    const current = data.find(t => t.id === id)
    return current
}

const addTodo = async (todo: Omit<ServerTodoType, 'id'>): Promise<void> => {
    const uniqueTask = { ...todo }
    const response = await fetch(`${URL}/todos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(uniqueTask)
    })
    if (!response.ok) throw new Error("Error of adding todo")
}

const removeTodo = async (id: number): Promise<void> => {
    const response = await fetch(`${URL}/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (!response.ok) throw new Error("Error of deleting a todo")
}

const patchTodo = async (id: number, todo: Partial<ServerTodoType>): Promise<void> => {
    const response = await fetch(`${URL}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(todo)
    })
    if (!response.ok) throw new Error("Error of patching a task")
}

app.get('/todos', async (req: Request, res: Response) => {
    try {
        res.send(await getDataFromBD())
    } catch (err) {
        console.error(err)
        return
    }
})

app.get(`/todos/:id`, async (req: Request, res: Response) => {
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

app.post('/todos', async (req: Request, res: Response) => {
    try {
        const newTask: ServerTodoType = {
            id: Date.now(),
            title: req.body.title,
            description: req.body.description,
            isCompleted: req.body.isCompleted
        }
        const readed = await fs.promises.readFile(pathToBD, "utf-8")
        const parsed = JSON.parse(readed)
        await fs.promises.writeFile(pathToBD, JSON.stringify([ ...parsed, newTask ]), "utf-8")
        res.status(201).json({ message: "Task adding was successfully", task: newTask})
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Post todo error" })
    }
})

app.listen(PORT, () => console.log(`Server is running on localhost:${PORT}`))
