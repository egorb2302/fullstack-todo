import { beforeAll, describe, expect, it } from "vitest";
import { app } from '../../server';
import request from 'supertest';

describe('API Integration Tests', () => {
    let agent: request.Agent;
    let token: string;
    let userId: number;
    let taskId: number;

    describe('Auth Endpoints', () => {
        it('should login a user', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'vitest@example.com',
                    password: '123123'
                })

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('vitest@example.com');
            expect(response.body.user.id).toBe(3)
            userId = response.body.user.id
        })
    })

    describe('Todo Endpoints', () => {
        beforeAll(async () => {
            agent = request.agent(app)

            const response = await agent
                .post('/auth/login')
                .send({
                    email: 'vitest@example.com',
                    password: '123123'
                })

            token = response.body.token
        })

        it('should create a todo', async () => {
            const response = await agent
                .post('/todos')
                .send({
                    title: 'Test Todo',
                    description: 'Test Description'
                });

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('task')
            expect(response.body.task.title).toBe('Test Todo')
            taskId = response.body.task.id
        })

        it('should get all tasks', async () => {
            const response = await agent
                .get('/todos');

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })

        it('should get only one task', async () => {
            const response = await agent
                .get(`/todos/${taskId}`);

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('title');
            expect(response.body.title).toBe('Test Todo');
        })

        it('should patch the task', async () => {
            const response = await agent
                .patch(`/todos/${taskId}`)
                .send({
                    isCompleted: true
                })

            expect(response.status).toBe(200)
            expect(response.body.todo).toHaveProperty('isCompleted');
            expect(response.body.todo.isCompleted).toBe(true)
        })

        it('should delete the task', async () => {
            const response = await agent
                .delete(`/todos/${taskId}`)

            expect(response.status).toBe(200)
        })

        it('should return 404 for non-existent todo', async () => {
            const response = await agent
                .get('/todos/999')

            expect(response.status).toBe(404)
        })
    })
})