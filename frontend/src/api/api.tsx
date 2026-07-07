import type { LoginType } from '../pages/Login';
import type { RegisterRequest } from '../pages/SignUp';
import type { ProfileType, Todo } from '../types/types';

// localhost:5000
const API_BASE = "https://supportive-commitment-production-2930.up.railway.app" 
const TODOS_URL = `${API_BASE}/todos`
const REGISTER_URL = `${API_BASE}/auth/register`
const LOGIN_URL = `${API_BASE}/auth/login`
const REFRESH_URL = `${API_BASE}/auth/refresh`

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export const getAllTodos = async (): Promise<Todo[]> => {
    let response = await fetch(TODOS_URL, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
            response = await fetch(TODOS_URL, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) throw new Error("Error of loading all todos")
    const data = await response.json()
    return Array.isArray(data) ? data : [];
}

export const getTodo = async (id: number): Promise<Todo> => {
    let response = await fetch(`${TODOS_URL}/${id}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
            response = await fetch(`${TODOS_URL}/${id}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) throw new Error(`Error of loading todo with id ${id}`)
    const data: Todo = await response.json()
    return data
}

export const deleteTodo = async (id: number): Promise<void> => {
    let response = await fetch(`${TODOS_URL}/${id}`, {
        credentials: 'include',
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
            response = await fetch(`${TODOS_URL}/${id}`, {
                credentials: 'include',
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) throw new Error(`Error of deleting todo with id ${id}`)
}

export const addTodo = async (task: Omit<Todo, "id">): Promise<Todo> => {
    let response = await fetch(TODOS_URL, {
        credentials: 'include',
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task)
    })

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
            response = await fetch(TODOS_URL, {
                credentials: 'include',
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task)
            });
        } else {
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) throw new Error(`Error with adding task with body ${JSON.stringify(task)}`)
    const data = await response.json()
    return data
}

export const patchTodo = async ({ id, ...task }: { id: number } & Partial<Todo>): Promise<Todo> => {
    let response = await fetch(`${TODOS_URL}/${id}`, {
        credentials: 'include',
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task)
    })

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
            response = await fetch(`${TODOS_URL}/${id}`, {
                credentials: 'include',
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task)
            });
        } else {
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) throw new Error(`Error with adding task with body ${JSON.stringify(task)}`)
    const data = await response.json()
    return data
}

export const registerAPI = async (newUser: RegisterRequest): Promise<void> => {
    let response = await fetch(REGISTER_URL, {
        credentials: 'include',
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(newUser)
    });

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
            response = await fetch(REGISTER_URL, {
                credentials: 'include',
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser)
            });
        } else {
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) throw new Error("Error of loading all users")
}

export const login = async (user: LoginType): Promise<void> => {
    let response = await fetch(LOGIN_URL, {
        credentials: 'include',
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(user)
    })

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
            response = await fetch(LOGIN_URL, {
                credentials: 'include',
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });
        } else {
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) throw new Error("Error of adding a user")
    const data = await response.json()
    return data.user
}

export const getCurrentUser = async (): Promise<ProfileType | null> => {
    let response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
    })

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
            response = await fetch(`${API_BASE}/auth/me`, {
                credentials: 'include',
            });
        } else {
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }
    }

    if (response.ok) {
        const user = await response.json()
        return user
    }

    return null
}

export const logout = async (): Promise<void> => {
    let response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    })

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
            response = await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } else {
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) throw new Error('Error of logout on client')
}

const refreshAccessToken = async (): Promise<boolean> => {
    if (isRefreshing && refreshPromise) {
        try {
            await refreshPromise;
            return true;
        } catch {
            return false;
        }
    }

    isRefreshing = true;

    try {
        const response = await fetch(REFRESH_URL, {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            refreshPromise = Promise.resolve('refreshed');
            return true;
        } else {
            refreshPromise = null
            return false;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    } finally {
        isRefreshing = false;
        refreshPromise = null;
    }
};