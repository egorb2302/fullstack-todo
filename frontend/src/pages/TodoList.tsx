import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteTodo, getAllTodos, patchTodo } from "../api/api";
import { Link } from "react-router";
import { useState } from "react";
import Modal from "../components/TaskModal";
import NoTasks from "../components/HaveNoTasks";
import Check from "../components/Check";

/**
 * Список задач как листинг файла: колонка номеров строк, ключевые слова
 * TODO/DONE подсвечены как синтаксис, описание — комментарий курсивом.
 * После последней строки мигает каретка — приглашение начать новую.
 */
export default function TodoList() {
    const client = useQueryClient();
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
    const { data: todos, isLoading, error } = useQuery({
        queryKey: ['todos'],
        queryFn: async () => getAllTodos()
    })

    const deleteMutation = useMutation({
        mutationFn: deleteTodo,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ['todos'] })
        },
        onError: (error) => {
            console.error('Delete error:', error);
        }
    })

    const completeMutation = useMutation({
        mutationFn: patchTodo,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ['todos'] })
        },
        onError: (error) => {
            console.error("Completing error:", error)
        }
    })

    const handleModal = async (): Promise<void> => {
        setModalIsOpen(false)
        client.invalidateQueries({ queryKey: ['todos'] });
    }

    return (
        <Check isLoading={isLoading} error={error} data={todos}>
            {(todos) => {
                if (todos.length === 0) return <NoTasks />
                const done = todos.filter((todo) => todo.isCompleted).length;

                return (
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                                <span className="font-mono text-accent">//</span> All todos
                            </h1>
                            <button
                                className="btn-accent"
                                onClick={() => setModalIsOpen(true)}
                            >
                                + add task
                            </button>
                        </div>

                        <section className="sheet mt-8 overflow-hidden" aria-label="Task list">
                            {/* Шапка файла: имя слева, счётчик строк справа */}
                            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 sm:px-5">
                                <span className="flex items-center gap-2 font-mono text-xs text-soft">
                                    <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
                                    tasks
                                </span>
                                <span className="font-mono text-xs tabular-nums text-faint">
                                    {todos.length} {todos.length === 1 ? "line" : "lines"} · {done} done
                                </span>
                            </div>

                            <ul>
                                {todos.map((todo, index) => (
                                    <li
                                        key={todo.id}
                                        className="group flex animate-row-in border-b border-line transition-colors duration-150 hover:bg-bg/60"
                                        style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
                                    >
                                        <span className="gutter-cell" aria-hidden>
                                            {String(index + 1).padStart(2, "0")}
                                        </span>

                                        <div className="min-w-0 flex-1 px-4 py-3.5 sm:px-5">
                                            <div className="flex items-baseline gap-2.5">
                                                <span
                                                    className={`kw ${todo.isCompleted ? "text-ok" : "text-accent"}`}
                                                    aria-hidden
                                                >
                                                    {todo.isCompleted ? "DONE" : "TODO"}
                                                </span>
                                                <Link
                                                    to={`/todos/${todo.id}`}
                                                    className={`min-w-0 font-mono text-[0.9375rem] font-medium transition-colors duration-150 hover:text-accent ${
                                                        todo.isCompleted
                                                            ? "text-soft line-through decoration-[1.5px]"
                                                            : "text-ink"
                                                    }`}
                                                >
                                                    {todo.title}
                                                </Link>
                                                <span className="sr-only">
                                                    {todo.isCompleted ? "Completed" : "In Progress"}
                                                </span>
                                            </div>

                                            {todo.description && (
                                                <p className="comment">
                                                    <span aria-hidden>{"// "}</span>
                                                    {todo.description}
                                                </p>
                                            )}

                                            <div className="mt-2.5 flex items-center gap-1.5 pointer-fine:opacity-0 pointer-fine:transition-opacity pointer-fine:duration-150 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100">
                                                {!todo.isCompleted && (
                                                    <button
                                                        onClick={() => completeMutation.mutate({ id: todo.id, isCompleted: true })}
                                                        className="h-10 cursor-pointer rounded-md px-3 font-mono text-xs text-ok transition-colors duration-150 hover:bg-ok/10"
                                                    >
                                                        {completeMutation.isPending ? "completing..." : "complete"}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteMutation.mutate(todo.id)}
                                                    className="h-10 cursor-pointer rounded-md px-3 font-mono text-xs text-danger transition-colors duration-150 hover:bg-danger/10"
                                                >
                                                    {deleteMutation.isPending ? "deleting..." : "delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}

                                {/* Следующая строка файла: каретка ждёт новую задачу */}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setModalIsOpen(true)}
                                        className="flex w-full cursor-pointer text-left transition-colors duration-150 hover:bg-bg/60"
                                    >
                                        <span className="gutter-cell" aria-hidden>
                                            {String(todos.length + 1).padStart(2, "0")}
                                        </span>
                                        <span className="flex items-center gap-2.5 px-4 py-3.5 font-mono text-sm text-faint sm:px-5">
                                            <span className="caret" aria-hidden />
                                            start a new line
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </section>

                        {modalIsOpen && <Modal onAccepted={handleModal} onClose={() => setModalIsOpen(false)} />}
                    </div>
                )
            }}
        </Check>
    )
}
