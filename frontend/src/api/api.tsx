import type { LoginType } from '../pages/Login';
import type { RegisterRequest } from '../pages/SignUp';
import type { ProfileType, Todo } from '../types/types'
import { getToken } from '../utils/token';

const TODOS_URL = "http://localhost:5000/todos"
const REGISTER_URL = "http://localhost:5000/auth/register"
const LOGIN_URL = "http://localhost:5000/auth/login"
console.log("Запрос к ", TODOS_URL)

export const getAllTodos = async (): Promise<Todo[]> => {
    const response = await fetch(TODOS_URL, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) throw new Error("Error of loading all todos")
    const data = await response.json()
    return data
}

export const getTodo = async (id: number): Promise<Todo> => {
    const response = await fetch(`${TODOS_URL}/${id}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) throw new Error(`Error of loading todo with id ${id}`)
    const data: Todo = await response.json()
    return data
}

export const deleteTodo = async (id: number): Promise<void> => {
    const response = await fetch(`${TODOS_URL}/${id}`, {
        credentials: 'include',
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    if (!response.ok) throw new Error(`Error of deleting todo with id ${id}`)
}

export const addTodo = async (task: Omit<Todo, "id">): Promise<Todo> => {
    const response = await fetch(TODOS_URL, {
        credentials: 'include',
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task)
    })
    if (!response.ok) throw new Error(`Error with adding task with body ${JSON.stringify(task)}`)
    const data = await response.json()
    return data
}

export const patchTodo = async ({ id, ...task }: { id: number } & Partial<Todo>): Promise<Todo> => {
    const response = await fetch(`${TODOS_URL}/${id}`, {
        credentials: 'include',
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task)
    })
    if (!response.ok) throw new Error(`Error with adding task with body ${JSON.stringify(task)}`)
    const data = await response.json()
    return data
}

export const registerAPI = async (newUser: RegisterRequest): Promise<void> => {
    const response = await fetch(REGISTER_URL, {
        credentials: 'include',
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(newUser)
    });
    if (!response.ok) throw new Error("Error of loading all users")
}

export const login = async (user: LoginType): Promise<void> => {
    const response = await fetch(LOGIN_URL, {
        credentials: 'include',
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(user)
    })
    if (!response.ok) throw new Error("Error of adding a user")
    
    const data = await response.json()
    return data.user
}

export const getCurrentUser = async (): Promise<ProfileType | null> => {
    const response = await fetch('http://localhost:5000/auth/me', {
        credentials: 'include',
    })

    if (response.ok) {
        const user = await response.json()
        return user
    }

    return null
}