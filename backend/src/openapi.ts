import { desc } from "drizzle-orm";

export const openApiDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Todo API',
        version: '1.0.0',
        description: 'REST API for my Todo application'
    },
    servers: [{ url: 'http://localhost:5000' }],
    paths: {
        '/todos': {
            get: {
                summary: 'Get all tasks',
                responses: {
                    200: { description: 'Successfully' }
                }
            },
            post: {
                summary: 'Create task',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                                properties: {
                                    title: { type: 'string', maxLength: 100 },
                                    description: { type: 'string', maxLength: 500 },
                                    isCompleted: { type: 'boolean', default: false }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Created' },
                    500: { description: 'Internal server error'}
                }
            }
        },
        '/todos/{id}': {
            get: {
                summary: 'Get task by ID',
                parameters: [{
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' }
                }],
                responses: {
                    200: { description: 'Successfully' },
                    404: { description: 'Not found' },
                    500: { description: 'Internal server error' }
                }
            },
            patch: {
                summary: 'Patch the task',
                parameters: [{
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' }
                }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    isCompleted: { type: 'boolean' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Updated' },
                    404: { description: 'Not found' },
                    500: { description: 'Internal server error' }
                }
            },
            delete: {
                summary: 'Delete task',
                parameters: [{
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' }
                }],
                responses: {
                    200: { description: 'Deleted' },
                    404: { description: 'Not found' },
                    500: { description: 'Internal server error' }
                }
            }
        },
        '/auth/register': {
            post: {
                summary: 'Sending register data on server',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                                properties: {
                                    name: { type: 'string', maxLength: 100 },
                                    email: { type: 'string', maxLength: 500 },
                                    password: { type: 'string', minLength: 6 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Account created' },
                    400: { description: "Email and password are required"},
                    500: { description: 'Internal server error'}
                }
            }
        },
        '/auth/login': {
            post: {
                summary: 'Login with your data from server',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                                properties: {
                                    email: { type: 'string', maxLength: 500 },
                                    password: { type: 'string', minLength: 6 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Successfully login' },
                    400: { description: "Invalid email or password"},
                    500: { description: 'Internal server error'}
                }
            }
        },
        '/auth/me': {
            get: {
                summary: 'Get current state of your token',
                responses: {
                    200: { description: 'Successfully' },
                    401: { description: 'Unathorized' },
                    500: { description: 'Internal server error' }
                }
            },
        },
        '/auth/logout': {
            post: {
                summary: 'Logout request',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                            }
                        }
                    }
                },
            }
        },
        '/auth/refresh': {
            post: {
                summary: 'Token refresh',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                            }
                        }
                    }
                },
            }
        }
    }
};