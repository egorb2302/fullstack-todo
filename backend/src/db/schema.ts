import { boolean, pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";

export const todos = pgTable('todos', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    title: varchar('title', { length: 100 }).notNull(),
    description: varchar('description', { length: 500 }),
    isCompleted: boolean('is_completed').default(false) 
})

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 100 }),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferSelect;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;