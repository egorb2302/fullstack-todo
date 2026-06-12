import { useQuery } from "@tanstack/react-query";
import { getAllTodos } from "../api/api";
import { Link } from "react-router";

export default function TodoList() {
    const { data, isPending, error } = useQuery({
        queryKey: ['todos'],
        queryFn: async () => getAllTodos()
    })

    if (isPending) return <div>Loading...</div>
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
                            {todo.isComplete 
                            ? "Completed" 
                            : "In Progress..."}
                        </p>
                        <Link to={`/todos/${todo.id}`}>
                            <button>go to the task</button>
                        </Link>
                    </div>)
                )}
            </div>
        </div>
    )
}