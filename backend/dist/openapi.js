"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiDocument = void 0;
exports.openApiDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Todo API',
        version: '1.0.0',
        description: 'REST API for my Todo application'
    },
    servers: [{ url: 'http://localhost:5000' }],
    tags: [
        {
            name: 'Todos',
            description: 'Task managment'
        },
        {
            name: 'Auth',
            description: 'Authenticate and user managment'
        },
        {
            name: 'Queue',
            description: 'Queue state and database info'
        }
    ],
    paths: {
        '/todos': {
            get: {
                tags: ['Todos'],
                summary: 'Get all tasks',
                responses: {
                    200: { description: 'Successfully' }
                }
            },
            post: {
                tags: ['Todos'],
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
                    500: { description: 'Internal server error' }
                }
            }
        },
        '/todos/{id}': {
            get: {
                tags: ['Todos'],
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
                tags: ['Todos'],
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
                tags: ['Todos'],
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
                tags: ['Auth'],
                summary: 'Sending register data on server',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
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
                    400: { description: 'Email and password are required' },
                    500: { description: 'Internal server error' }
                }
            }
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login with your data from server',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
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
                    400: { description: 'Invalid email or password' },
                    500: { description: 'Internal server error' }
                }
            }
        },
        '/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get current state of your token',
                responses: {
                    200: { description: 'Successfully' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Internal server error' }
                }
            }
        },
        '/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Logout request',
                responses: {
                    200: { description: 'Successfully logged out' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Internal server error' }
                }
            }
        },
        '/auth/refresh': {
            post: {
                tags: ['Auth'],
                summary: 'Token refresh',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refreshToken'],
                                properties: {
                                    refreshToken: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Tokens refreshed' },
                    401: { description: 'Invalid refresh token' },
                    500: { description: 'Internal server error' }
                }
            }
        },
        '/queue/stats': {
            get: {
                get: {
                    tags: ['Queue'],
                    summary: 'Get queue state and db info',
                    responses: {
                        200: { description: 'Successfully' },
                        500: { description: 'Internal server error' }
                    }
                }
            }
        }
    }
};
