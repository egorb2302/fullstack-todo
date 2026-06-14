import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addTodo } from "../api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

    const onSubmit = async (data: createTaskType) => {
        if (!data) {
            console.error("Cant take data from addTask form")
            return
        }
        mutation.mutate({ ...data, isCompleted: false })
        onAccepted()
        console.log("Adding task in todos is successfully!")
    }

    return (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: "column",
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '16px',
          gap: '20px'
        }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>
                        Title:
                    </label>
                    <input {...register("title")} />
                    {errors.title && <span>{errors.title.message}</span>}
                </div>
                <div>
                    <label>
                        Description:
                    </label>
                    <input {...register("description")} />
                    {errors.description && <span>{errors.description.message}</span>}
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add"}
                </button>
            </form>
            <button onClick={() => onClose()}>close</button>
        </div>
    )
}