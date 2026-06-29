import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteTodo, getAllTodos, patchTodo } from "../api/api";
import { Link } from "react-router";
import { useState } from "react";
import Modal from "../components/TaskModal";
import Unauthorized from "../components/Unauthorized";
import NoTasks from "../components/HaveNoTasks";

export default function TodoList() {
    console.log('🔥 TodoList rendered');
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

    if (isLoading) return <div>Loading...</div>
    if (error) throw new Error(error.message)
    if (!todos) return <Unauthorized />
    if (todos.length === 0) return <NoTasks />

    return (
        <div className="min-h-screen bg-[#f5f5f0] flex justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    <span className="text-orange-500">//</span> All todos
                </h1>
                <button 
                    className="px-5 py-2.5 bg-linear-to-r from-orange-400 to-amber-500 text-white rounded-xl 
                    hover:opacity-90 font-medium transition-opacity cursor-pointer"
                    onClick={() => setModalIsOpen(true)}
                >
                    + add task
                </button>
                </div>
                
                <div className="space-y-3">
                {todos.map(todo => (
                    <div key={todo.id} 
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                    <div className="flex items-start justify-between">
                        <div>
                        <h3 className="text-lg font-semibold text-gray-900">{todo.title}</h3>
                        <p className="text-gray-500 mt-1">{todo.description}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 text-sm font-mono
                        ${todo.isCompleted === true ? 'text-green-600' : 'text-amber-600'}`}
                        >
                        <span className={`w-2 h-2 rounded-full ${todo.isCompleted ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        {todo.isCompleted === true ? "Completed" : "In Progress"}
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                        <Link to={`/todos/${todo.id}`}>
                        <button className="text-orange-500 cursor-pointer hover:text-orange-600 text-sm font-mono">
                            view task →
                        </button>
                        </Link>
                        
                        <div className="space-x-2">
                        <button 
                            onClick={() => completeMutation.mutate({ id: todo.id, isCompleted: true })}
                            className="px-4 py-1.5 bg-gray-50 cursor-pointer text-green-600 border border-green-300 rounded-lg hover:bg-green-100 text-sm font-mono transition-colors"
                        >
                            {completeMutation.isPending ? "completing..." : "complete"}
                        </button>
                        <button 
                            onClick={() => deleteMutation.mutate(todo.id)}
                            className="px-4 py-1.5 bg-gray-50 cursor-pointer text-red-500 border border-red-300 rounded-lg hover:bg-red-100 text-sm font-mono transition-colors"
                        >
                            {deleteMutation.isPending ? "deleting..." : "delete"}
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            
            {modalIsOpen && <Modal onAccepted={handleModal} onClose={() => setModalIsOpen(false)}/>}
            </div>
    )
}