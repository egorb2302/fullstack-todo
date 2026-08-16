import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addTodo } from "../api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const createTaskSchema = z.object({
    title: z.string(),
    description: z.string(),
})

interface ForMutationType {
    title: string,
    description: string,
    isCompleted: boolean
}

type createTaskType = z.infer<typeof createTaskSchema>

export default function Modal({ onAccepted, onClose }: { onAccepted: () => void, onClose: () => void }) {
    const client = useQueryClient()
    const { register, handleSubmit, formState: { errors, isSubmitting }} = useForm<createTaskType>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            title: '',
            description: '',
        }
    })

    const mutation = useMutation({
        mutationFn: (data: ForMutationType) => addTodo(data),
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ['todos'] })
        },
        onError: (error) => {
            console.error(error.message)
        }
    })

    // Escape закрывает модалку, как любой диалог
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const onSubmit = async (data: createTaskType) => {
        if (!data) {
            console.error("Cant take data from addTask form")
            return
        }
        mutation.mutate({ ...data, isCompleted: false })
        onAccepted()
    }

    return (
        <div
            className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-black/60 p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-task-title"
                className="sheet w-full max-w-md animate-pop-in bg-overlay p-6 shadow-2xl sm:p-7"
            >
                <h2 id="new-task-title" className="text-xl font-bold text-ink">
                    <span className="font-mono text-accent">//</span> New task
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                    <div>
                        <label htmlFor="task-title" className="mb-1.5 block font-mono text-xs text-soft">
                            Title
                        </label>
                        <input
                            id="task-title"
                            {...register("title")}
                            autoFocus
                            className="field"
                            placeholder="What needs doing"
                        />
                        {errors.title && (
                            <span className="mt-1.5 block font-mono text-xs text-danger">{errors.title.message}</span>
                        )}
                    </div>
                    <div>
                        <label htmlFor="task-description" className="mb-1.5 block font-mono text-xs text-soft">
                            Description
                        </label>
                        <textarea
                            id="task-description"
                            {...register("description")}
                            rows={3}
                            className="field resize-none"
                            placeholder="Details worth keeping"
                        />
                        {errors.description && (
                            <span className="mt-1.5 block font-mono text-xs text-danger">{errors.description.message}</span>
                        )}
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="submit" disabled={isSubmitting} className="btn-accent flex-1">
                            {isSubmitting ? "Adding..." : "Add"}
                        </button>
                        <button type="button" onClick={() => onClose()} className="btn-ghost">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
