import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { getTodo } from "../api/api";
import type { Todo } from "../types/types";
import Check from "../components/Check";

export default function TodoDetails() {
    const { id } = useParams();
    const trueID = Number(id)
    const { data, isLoading, error } = useQuery<Todo>({
        // id в ключе, иначе при переходе между задачами показывается кеш предыдущей
        queryKey: ['todo', trueID],
        queryFn: () => getTodo(trueID)
    })

    if (isNaN(trueID)) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <p className="font-mono text-sm text-danger">Invalid todo ID</p>
                <Link
                    to="/todos"
                    className="font-mono text-sm text-soft transition-colors duration-150 hover:text-accent"
                >
                    ← back to tasks
                </Link>
            </div>
        );
    }

    return (
        <Check isLoading={isLoading} error={error} data={data}>
            {(data) => (
                <div>
                    <Link
                        to="/todos"
                        className="font-mono text-sm text-soft transition-colors duration-150 hover:text-accent"
                    >
                        ← back to tasks
                    </Link>

                    <article className="sheet mt-5 animate-pop-in overflow-hidden">
                        {/* Шапка файла: путь до строки и её статус */}
                        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 sm:px-5">
                            <span className="font-mono text-xs text-soft">tasks / {data.id}</span>
                            <span
                                className={`flex items-center gap-1.5 font-mono text-xs ${
                                    data.isCompleted ? "text-ok" : "text-accent"
                                }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${data.isCompleted ? "bg-ok" : "bg-accent"}`}
                                    aria-hidden
                                />
                                {data.isCompleted ? "Completed" : "In Progress"}
                            </span>
                        </div>

                        <div className="flex">
                            <span className="gutter-cell pb-4" aria-hidden>01</span>
                            <div className="min-w-0 flex-1 px-4 py-4 sm:px-5">
                                <span
                                    className={`kw ${data.isCompleted ? "text-ok" : "text-accent"}`}
                                    aria-hidden
                                >
                                    {data.isCompleted ? "DONE" : "TODO"}
                                </span>
                                <h1
                                    className={`mt-1.5 font-mono text-xl font-semibold leading-snug sm:text-2xl ${
                                        data.isCompleted
                                            ? "text-soft line-through decoration-2"
                                            : "text-ink"
                                    }`}
                                >
                                    {data.title}
                                </h1>

                                {data.description && (
                                    <p className="comment mt-3 text-sm">
                                        <span aria-hidden>{"// "}</span>
                                        {data.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </article>
                </div>
            )}
        </Check>
    )
}
