import type { ServerTodoType } from "../types/types"
import { db } from '../db/index';
import { todos } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getDataFromBD = async (): Promise<ServerTodoType[]> => {
    const database = await db.select().from(todos)
    return database
}

export const getTodo = async (id: number): Promise<ServerTodoType | undefined> => {
    const current = await db.select().from(todos).where(eq(todos.id, id))
    return current[0]
}