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
        <div key={data.id} className="min-h-screen bg-[#f5f5f0] flex justify-center p-6">
            <div className="w-full max-w-2xl mt-8">
                <Link to="/todos">
                <button className="cursor-pointer text-orange-500 hover:text-orange-600 text-sm font-mono mb-6 inline-block">
                    ← back to tasks
                </button>
                </Link>
                
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>
                        <div className={`flex items-center gap-1.5 text-sm font-mono
                        ${data.isCompleted ? 'text-green-600' : 'text-amber-600'}`}
                        >
                            <span className={`w-2 h-2 rounded-full ${data.isCompleted ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            {data.isCompleted ? "Completed" : "In Progress"}
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-mono text-gray-400 mb-2">Description</h3>
                        <p className="text-gray-700 text-lg leading-relaxed">{data.description}</p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`px-4 py-2 rounded-lg font-mono text-sm
                                ${data.isCompleted 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                            >
                                {data.isCompleted ? "✓ Task completed" : "○ Task in progress"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}