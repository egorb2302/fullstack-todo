import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteTodo, getAllTodos, patchTodo } from "../api/api";
import { Link } from "react-router";
import { useState } from "react";
import Modal from "../components/TaskModal";

export default function TodoList() {
    const client = useQueryClient();
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
    const { data, isLoading, error } = useQuery({
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
        location.reload()
    }

    if (isLoading) return <div>Loading...</div>
    if (error) throw new Error(error.message)

    return (
        <div>
            <h1>All todos:</h1>
            <div>
                {data?.map(todo =>
                    (<div key={todo.id}>
                        <h3>{todo.title}</h3>   
                        <p>{todo.description}</p>
                        <p>
                            {todo.isCompleted
                            ? "Completed" 
                            : "In Progress..."}
                        </p>
                        <Link to={`/todos/${todo.id}`}>
                            <button>go to the task</button>
                        </Link>
                        <div>
                            <button onClick={() => completeMutation.mutate({ id: todo.id, isCompleted: true })}>
                                {completeMutation.isPending ? "completing..." : "complete"}
                            </button>
                            <button onClick={() => deleteMutation.mutate(todo.id)}>
                                {deleteMutation.isPending ? "deleting..." : "delete"}
                            </button>
                        </div>
                    </div>)
                )}
            </div>
            <button style={{position: "absolute", bottom: "30px", left: "30px", padding: "12px", fontSize: "20px"}}
                onClick={() => setModalIsOpen(true)}>
                add task
            </button>
            {modalIsOpen && <Modal onAccepted={handleModal} onClose={() => setModalIsOpen(false)}/>}
        </div>
    )
}