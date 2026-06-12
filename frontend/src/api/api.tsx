import type { Todo } from '../types/types'

const TODOS_URL = "http://localhost:5000/todos"
console.log("Запрос к ", TODOS_URL)

export const getAllTodos = async (): Promise<Todo[]> => {
    const response = await fetch(TODOS_URL);
    if (!response.ok) throw new Error("Error of loading all todos")
    const data = await response.json()
    return data
}

export const getTodo = async (id: number): Promise<Todo> => {
    const response = await fetch(`${TODOS_URL}/${id}`);
    if (!response.ok) throw new Error(`Error of loading todo with id ${id}`)
    const data: Todo = await response.json()
    return data
}

export const deleteTodo = async (id: number): Promise<void> => {
    const response = await fetch(`${TODOS_URL}/${id}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    if (!response.ok) throw new Error(`Error of deleting todo with id ${id}`)
}

export const addTodo = async (task: Todo): Promise<Todo> => {
    const response = await fetch(TODOS_URL, {
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

export const patchTodo = async (id: number, task: Todo): Promise<Todo> => {
    const response = await fetch(`${TODOS_URL}/${id}`, {
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