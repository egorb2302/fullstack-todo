import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { loginHelper } from '../helpers/login';

describe('API Integration Tests', () => {
    let cookie: string;
    let taskId: number;

    beforeAll(async () => {
        const login = await loginHelper();
        cookie = login.cookie;
    });

    describe('Auth Endpoints', () => {
        it('should login a user', async () => {
            const login = await loginHelper();

            expect(login.cookie).toBeDefined();
        });
    });

    describe('Todo Endpoints', () => {
        it('should create a todo', async () => {
            const response = await request(app)
                .post('/todos')
                .set('Cookie', cookie)
                .send({
                    title: 'Test Todo',
                    description: 'Test Description',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('task');
            expect(response.body.task.title).toBe('Test Todo');
            taskId = response.body.task.id;
        });

        it('should get all tasks', async () => {
            const response = await request(app)
                .get('/todos')
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should get only one task', async () => {
            const response = await request(app)
                .get(`/todos/${taskId}`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('title');
            expect(response.body.title).toBe('Test Todo');
        });

        it('should patch the task', async () => {
            const response = await request(app)
                .patch(`/todos/${taskId}`)
                .set('Cookie', cookie)
                .send({
                    isCompleted: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.todo).toHaveProperty('isCompleted');
            expect(response.body.todo.isCompleted).toBe(true);
        });

        it('should delete the task', async () => {
            const response = await request(app)
                .delete(`/todos/${taskId}`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
        });

        it('should return 404 for non-existent todo', async () => {
            const response = await request(app)
                .get('/todos/999')
                .set('Cookie', cookie);

            expect(response.status).toBe(404);
        });
    });
});
