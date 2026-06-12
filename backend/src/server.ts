import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { ServerTodoType } from './types/types';

dotenv.config()
const PORT = process.env.PORT || "5000"
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

app.listen(PORT, () => console.log(`Server is running on localhost:${PORT}`))
