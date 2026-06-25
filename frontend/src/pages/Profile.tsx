import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/api";
import { useNavigate } from "react-router";
import { logout } from "../utils/logout";
import { usernameOutput } from "../utils/username";
import Unauthorized from "../components/Unauthorized";
import { Link } from 'react-router';

export default function Profile() {
    const { data: users , isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: () => getCurrentUser(),
    })
    const nav = useNavigate()

    const logoutHandler = () => {
        logout()
        nav('/auth/login')
    }

    if (isLoading) return <div>Loading...</div>
    if (error) throw new Error('Error of profile loading: ', error)
    if (!users) return <Unauthorized />

    return (
        <div className="min-h-screen bg-[#f5f5f0] flex justify-center p-6">
            <div className="w-full max-w-md mt-20">
                <Link 
                    to="/" 
                    className="text-orange-500 hover:text-orange-600 text-sm font-mono transition-colors inline-block mb-6"
                >
                    ← back to home
                </Link>
                
                <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-12">
                        <span className="text-orange-500">//</span> Profile
                    </h1>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-center">
                            <div className="w-24 h-24 bg-linear-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-6">
                                {usernameOutput(users)}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-mono text-gray-500 mb-1">Name</label>
                            <h2 className="text-lg font-semibold text-gray-900">{users.name}</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-mono text-gray-500 mb-1">Email</label>
                            <h2 className="text-lg text-gray-700 font-mono">{users.email}</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-mono text-gray-500 mb-1">ID</label>
                            <p className="text-sm font-mono text-gray-400">{users.id}</p>
                        </div>   
                        <button 
                        onClick={logoutHandler}
                        className="w-full px-5 py-2.5 bg-gray-50 text-red-500 border border-red-300 rounded-lg 
                        hover:bg-red-100 text-sm font-mono transition-colors cursor-pointer mt-6"
                        >
                        logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}