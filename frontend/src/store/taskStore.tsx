import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Todo, TodoStore } from "../types/types";

const useTaskStore = create<TodoStore>()(
    persist(
        (set, get) => ({
            todos: [],

            getTodos: () => {
                const { todos } = get();
                return todos
            },

            addTodo: (todo: Todo) => {
                const { todos } = get();
                set({
                    todos: [...todos, todo]
                })
            },

            removeTodo: (id: number) => {
                const { todos } = get();
                set({
                    todos: todos.filter(todo => todo.id !== id)
                })
            },

            editTodo: (todo: Todo) => {
                const { todos } = get();
                set({
                    todos: todos.map(i => {
                        if (i.id === todo.id) {
                            return todo
                        } else {
                            return i
                        }
                    })
                })
            }
        }),
        {
            name: "task-store"
        }
    )
)

export default useTaskStore