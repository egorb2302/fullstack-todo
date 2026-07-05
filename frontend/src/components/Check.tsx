import type { GuardProps } from "../types/types";
import Unauthorized from '../components/Unauthorized';

export default function Check<T>({isLoading, error, data, children}: GuardProps<T>) {
        if (isLoading) {
                return <div className="flex justify-center items-center h-screen">
                                <div className="text-xl text-gray-500">Loading...</div>
                        </div>;
        }

        if (error) {
            console.log(error)
            return (
                <div className="text-center py-10 text-red-500">
                    <h3 className="text-xl font-semibold">Oops! Something went wrong</h3>
                    <p className="mt-2">{error.message}</p>
                    <button 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => window.location.reload()}
                    >
                        Try again
                    </button>
                </div>
            );
        }
        
        if (!data) return <Unauthorized />

        return <>{children(data)}</>
}