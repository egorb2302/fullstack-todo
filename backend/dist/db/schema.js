"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.todos = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.todos = (0, pg_core_1.pgTable)('todos', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 100 }).notNull(),
    description: (0, pg_core_1.varchar)('description', { length: 500 }),
    isCompleted: (0, pg_core_1.boolean)('is_completed').default(false)
});
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }),
});
