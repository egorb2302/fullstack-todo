export interface Todo {
    id: number,
    title: string,
    description: string,
    isComplete: boolean
}

export interface TodoStore {
    todos: Todo[],
    addTodo: (todo: Todo) => void,
    removeTodo: (id: number) => void,
    editTodo: (todo: Todo) => void,
    getTodos: () => void
}