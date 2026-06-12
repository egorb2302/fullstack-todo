import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { getTodo } from "../api/api";
import type { Todo } from "../types/types";

export default function TodoDetails() {
    const { id } = useParams();
    const trueID = Number(id)
    const { data, isPending, error } = useQuery<Todo>({
        queryKey: ['todo'],
        queryFn: () => getTodo(trueID)
    })

    if (isNaN(trueID)) {
        return <div>Invalid todo ID</div>;
    }
    if (isPending) return <div>Loading...</div>
    if (error) throw new Error("Error of loading todo")
    if (!data) return <div>Cant get data of todo</div>

    return (
        <div key={data.id}>
            <h1>{data.title}</h1>
            <p>{data.description}</p>
            <p>
                {data.isComplete 
                ? "Complete" 
                : "In Progress"}
            </p>
            <Link to="/todos">
                <button>
                    back to tasks
                </button>
            </Link>
        </div>
    )
}