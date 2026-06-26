"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryParamsSchema = exports.paramsSchema = exports.taskSchema = exports.createSchema = void 0;
const zod_1 = require("zod");
exports.createSchema = zod_1.z.object({
    title: zod_1.z.string().max(100, "Max title length is 100 chars"),
    description: zod_1.z.string().max(500, "Max description length is 500 chars").optional(),
    isCompleted: zod_1.z.boolean().default(false)
});
exports.taskSchema = zod_1.z.object({
    title: zod_1.z.string().max(100).optional(),
    description: zod_1.z.string().max(500).optional(),
    isCompleted: zod_1.z.boolean().optional()
});
exports.paramsSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'ID must be a number')
});
exports.queryParamsSchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).optional().transform(Number),
    limit: zod_1.z.string().regex(/^\d+$/).optional().transform(Number),
    search: zod_1.z.string().max(100)
});
