import { pathToBD } from '../server';
import type { ServerTodoType } from "../types/types"
import fs from "fs";

export const getDataFromBD = async (): Promise<ServerTodoType[]> => {
    const dbData = await fs.promises.readFile(pathToBD, "utf-8")
    const database = await JSON.parse(dbData)
    return database
}

export const getTodo = async (id: number): Promise<ServerTodoType | undefined> => {
    const data = await getDataFromBD()
    const current = data.find(t => t.id === id)
    return current
}