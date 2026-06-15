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
        <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-black/50 p-4 gap-5">
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-xl"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                <span className="text-orange-500">//</span> New task
                </h2>
                
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-mono text-gray-700 mb-1.5">
                    Title:
                    </label>
                    <input 
                    {...register("title")} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-gray-900 font-mono transition-colors"
                    placeholder="Enter title"
                    />
                    {errors.title && <span className="text-red-500 text-sm font-mono mt-1 block">{errors.title.message}</span>}
                </div>
                
                <div>
                    <label className="block text-sm font-mono text-gray-700 mb-1.5">
                    Description:
                    </label>
                    <input 
                    {...register("description")} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-gray-900 font-mono transition-colors"
                    placeholder="Enter description"
                    />
                    {errors.description && <span className="text-red-500 text-sm font-mono mt-1 block">{errors.description.message}</span>}
                </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 px-5 py-2.5 bg-linear-to-r from-orange-400 to-amber-500 text-white rounded-xl hover:opacity-90 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Adding..." : "Add"}
                </button>
                <button 
                    type="button"
                    onClick={() => onClose()} 
                    className="px-5 py-2.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 font-medium transition-colors"
                >
                    Close
                </button>
                </div>
            </form>
        </div>
    )
}