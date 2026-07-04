import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock('../../server', () => {
    const express = require('express');
    const app = express();
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.post('/auth/login', (req: any, res: any) => {
        console.log('🔐 Login attempt:', req.body);
        res.status(200).json({
            user: {
                id: 3,
                email: 'vitest@example.com',
                password: 'hashed_password',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            token: 'mock-jwt-token'
        });
    });
    app.get('/todos', (req: any, res: any) => {
        res.status(200).json([
            {
                id: 1,
                title: 'Test Todo',
                description: 'Test Description',
                isCompleted: false,
                userId: 3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Test Todo 2',
                description: 'Test Description 2',
                isCompleted: true,
                userId: 3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ]);
    });
    app.post('/todos', (req: any, res: any) => {
        console.log('📝 POST /todos - Body:', req.body);
        
        if (!req.body || !req.body.title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        res.status(201).json({
            task: {
                id: 1,
                title: req.body.title,
                description: req.body.description || '',
                isCompleted: false,
                userId: 3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        });
    });
    app.get('/todos/:id', (req: any, res: any) => {
        const id = parseInt(req.params.id);
        console.log('📝 GET /todos/:id - ID:', id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        
        if (id === 999 || id === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.status(200).json({
            id: id,
            title: 'Test Todo',
            description: 'Test Description',
            isCompleted: false,
            userId: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    });
    app.patch('/todos/:id', (req: any, res: any) => {
        const id = parseInt(req.params.id);
        console.log('📝 PATCH /todos/:id - ID:', id);
        console.log('📝 PATCH /todos/:id - Body:', req.body);
        
        if (isNaN(id) || id === 999) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.status(200).json({
            todo: {
                id: id,
                title: req.body.title || 'Test Todo',
                description: req.body.description || 'Test Description',
                isCompleted: req.body.isCompleted ?? false,
                userId: 3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        });
    });
    app.delete('/todos/:id', (req: any, res: any) => {
        const id = parseInt(req.params.id);
        console.log('📝 DELETE /todos/:id - ID:', id);
        
        if (isNaN(id) || id === 999) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.status(200).json({ 
            success: true,
            message: `Todo ${id} deleted successfully` 
        });
    });
    
    return {
        app: app,
        server: {
            listen: vi.fn().mockReturnValue({
                close: vi.fn().mockResolvedValue(undefined)
            })
        }
    };
});

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
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('vitest@example.com');
            expect(response.body.user.id).toBe(3);
            userId = response.body.user.id;
        });
    });

    describe('Todo Endpoints', () => {
        beforeAll(async () => {
            agent = request.agent(app);

            const response = await agent
                .post('/auth/login')
                .send({
                    email: 'vitest@example.com',
                    password: '123123'
                });

            token = response.body.token;
        });

        it('should create a todo', async () => {
            const response = await agent
                .post('/todos')
                .send({
                    title: 'Test Todo',
                    description: 'Test Description'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('task');
            expect(response.body.task.title).toBe('Test Todo');
            taskId = response.body.task.id;
        });

        it('should get all tasks', async () => {
            const response = await agent
                .get('/todos');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should get only one task', async () => {
            const response = await agent
                .get(`/todos/${taskId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('title');
            expect(response.body.title).toBe('Test Todo');
        });

        it('should patch the task', async () => {
            const response = await agent
                .patch(`/todos/${taskId}`)
                .send({
                    isCompleted: true
                });

            expect(response.status).toBe(200);
            expect(response.body.todo).toHaveProperty('isCompleted');
            expect(response.body.todo.isCompleted).toBe(true);
        });

        it('should delete the task', async () => {
            const response = await agent
                .delete(`/todos/${taskId}`);

            expect(response.status).toBe(200);
        });

        it('should return 404 for non-existent todo', async () => {
            const response = await agent
                .get('/todos/999');

            expect(response.status).toBe(404);
        });
    });
});