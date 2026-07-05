import type { GuardProps } from "../types/types";
import Unauthorized from '../components/Unauthorized';

export default function Check<T>({isLoading, error, data, children}: GuardProps<T>) {
        if (isLoading) {
                return <div className="flex justify-center items-center h-screen">
                                <div className="text-xl text-gray-500">Loading...</div>
                        </div>;
        }

        if (error) throw new Error('Error of profile loading: ', error);
        
        if (!data) return <Unauthorized />

        return <>{children(data)}</>
}