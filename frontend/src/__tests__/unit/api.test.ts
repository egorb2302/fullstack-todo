import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getAllTodos,
    getTodo,
    deleteTodo,
    addTodo,
    patchTodo,
    registerAPI,
    login,
} from '../../api/api';

import type { LoginType } from '../../pages/Login';
import type { RegisterRequest } from '../../pages/SignUp';
import type { Todo } from '../../types/types';

const mockFetch = vi.fn();
window.fetch = mockFetch;

const mockLocation = { href: '' };
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('API Layer Tests', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        mockLocation.href = '';
    });

    describe('getAllTodos', () => {
        it('should return todos on successful fetch', async () => {
            const mockTodos: Todo[] = [
                { id: 1, title: 'Todo 1', description: 'Desc 1', isCompleted: false },
                { id: 2, title: 'Todo 2', description: 'Desc 2', isCompleted: true },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockTodos,
            } as Response);

            const result = await getAllTodos();

            expect(result).toEqual(mockTodos);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://supportive-commitment-production-2930.up.railway.app/todos',
                {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('should return empty array when response is not an array', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ message: 'Invalid data' }),
            } as Response);

            const result = await getAllTodos();

            expect(result).toEqual([]);
        });

        it('should handle 401 and redirect after failed refresh', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                } as Response)
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                } as Response);

            await expect(getAllTodos()).rejects.toThrow('Session expired');
            expect(mockLocation.href).toBe('/auth/login');
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        it('should retry after successful refresh', async () => {
            const mockTodos: Todo[] = [
                { id: 1, title: 'Refreshed Todo', description: 'New', isCompleted: false },
            ];
            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ accessToken: 'new-token' }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockTodos,
                } as Response);

            const result = await getAllTodos();

            expect(result).toEqual(mockTodos);
            expect(mockFetch).toHaveBeenCalledTimes(3);
        });

        it('should throw error on non-401 error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            } as Response);

            await expect(getAllTodos()).rejects.toThrow('Error of loading all todos');
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('getTodo', () => {
        it('should return a single todo', async () => {
            const mockTodo: Todo = { id: 1, title: 'Todo 1', description: 'Desc 1', isCompleted: false };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockTodo,
            } as Response);

            const result = await getTodo(1);

            expect(result).toEqual(mockTodo);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://supportive-commitment-production-2930.up.railway.app/todos/1',
                {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        });

        it('should handle 401 and retry', async () => {
            const mockTodo: Todo = { id: 1, title: 'Retried Todo', description: 'Desc', isCompleted: false };
            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ accessToken: 'new-token' }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockTodo,
                } as Response);

            const result = await getTodo(1);

            expect(result).toEqual(mockTodo);
            expect(mockFetch).toHaveBeenCalledTimes(3);
        });

        it('should throw error when todo not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            } as Response);

            await expect(getTodo(999)).rejects.toThrow('Error of loading todo with id 999');
        });
    });

    describe('deleteTodo', () => {
        it('should delete a todo', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
            } as Response);

            await deleteTodo(1);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://supportive-commitment-production-2930.up.railway.app/todos/1',
                {
                    credentials: 'include',
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        });

        it('should handle 401 and retry', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ accessToken: 'new-token' }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                } as Response);

            await deleteTodo(1);

            expect(mockFetch).toHaveBeenCalledTimes(3);
        });

        it('should throw error on failed delete', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            } as Response);

            await expect(deleteTodo(1)).rejects.toThrow('Error of deleting todo with id 1');
        });
    });

    describe('addTodo', () => {
        const newTask: Omit<Todo, 'id'> = {
            title: 'New Todo',
            description: 'New Description',
            isCompleted: false,
        };

        it('should add a new todo', async () => {
            const createdTodo: Todo = { id: 1, ...newTask };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => createdTodo,
            } as Response);

            const result = await addTodo(newTask);

            expect(result).toEqual(createdTodo);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://supportive-commitment-production-2930.up.railway.app/todos',
                {
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTask),
                }
            );
        });

        it('should handle 401 and retry', async () => {
            const createdTodo: Todo = { id: 1, ...newTask };
            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ accessToken: 'new-token' }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 201,
                    json: async () => createdTodo,
                } as Response);

            const result = await addTodo(newTask);

            expect(result).toEqual(createdTodo);
            expect(mockFetch).toHaveBeenCalledTimes(3);
        });

        it('should throw error on failed add', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            } as Response);

            await expect(addTodo(newTask)).rejects.toThrow('Error with adding task with body');
        });
    });

    describe('patchTodo', () => {
        it('should patch a todo', async () => {
            const patchData = { id: 1, isCompleted: true };
            const patchedTodo: Todo = { id: 1, title: 'Todo', description: 'Desc', isCompleted: true };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => patchedTodo,
            } as Response);

            const result = await patchTodo(patchData);

            expect(result).toEqual(patchedTodo);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://supportive-commitment-production-2930.up.railway.app/todos/1',
                {
                    credentials: 'include',
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isCompleted: true }),
                }
            );
        });

        it('should handle 401 and retry', async () => {
            const patchedTodo: Todo = { id: 1, title: 'Todo', description: 'Desc', isCompleted: true };
            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ accessToken: 'new-token' }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => patchedTodo,
                } as Response);

            const result = await patchTodo({ id: 1, isCompleted: true });

            expect(result).toEqual(patchedTodo);
            expect(mockFetch).toHaveBeenCalledTimes(3);
        });
    });

    describe('auth endpoints', () => {
        const mockUser: RegisterRequest = {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
        };

        describe('registerAPI', () => {
            it('should register a new user', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 201,
                } as Response);

                await registerAPI(mockUser);

                expect(mockFetch).toHaveBeenCalledWith(
                    'https://supportive-commitment-production-2930.up.railway.app/auth/register',
                    {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-type': 'application/json' },
                        body: JSON.stringify(mockUser),
                    }
                );
            });

            it('should throw error on failed registration', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 400,
                } as Response);

                await expect(registerAPI(mockUser)).rejects.toThrow('Error of loading all users');
            });
        });

        describe('login', () => {
            const loginData: LoginType = {
                email: 'test@example.com',
                password: 'password123',
            };

            it('should login user', async () => {
                const mockResponse = { user: { id: 1, email: 'test@example.com', name: 'Test User' } };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockResponse,
                } as Response);

                const result = await login(loginData);

                expect(result).toEqual(mockResponse.user);
                expect(mockFetch).toHaveBeenCalledWith(
                    'https://supportive-commitment-production-2930.up.railway.app/auth/login',
                    {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-type': 'application/json' },
                        body: JSON.stringify(loginData),
                    }
                );
            });

            it('should throw error on failed login', async () => {
                mockFetch
                    .mockResolvedValueOnce({
                        ok: false,
                        status: 401,
                    } as Response)
                    .mockResolvedValueOnce({
                        ok: false,
                        status: 401,
                    } as Response)
                    .mockResolvedValueOnce({
                        ok: false,
                        status: 401,
                    } as Response);

                await expect(login(loginData)).rejects.toThrow('Session expired');
            });
        });
    });
});