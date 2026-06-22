import { boolean, pgTable, primaryKey, serial, varchar } from "drizzle-orm/pg-core";

export const todos = pgTable('todos', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 100 }).notNull(),
    description: varchar('description', { length: 500 }),
    isCompleted: boolean('is_completed').default(false) 
})

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferSelect;