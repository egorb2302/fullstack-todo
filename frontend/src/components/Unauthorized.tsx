import { Link } from 'react-router';

export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-[#f5f5f0] flex justify-center p-6">
            <div className="w-full max-w-md mt-20">
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        <span className="text-orange-500">//</span> Oops! You're unauthorized yet.
                    </h1>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-gray-600 text-sm font-mono mb-3">
                                Fix that with login
                            </h3>
                            <Link to="/auth/login">
                                <button className="px-5 py-2.5 bg-linear-to-r from-orange-400 to-amber-500 text-white rounded-xl 
                                hover:opacity-90 font-medium transition-opacity cursor-pointer">
                                    login
                                </button>
                            </Link>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-gray-600 text-sm font-mono mb-3">
                                Or, if you not registered before
                            </h3>
                            <Link to="/auth/register">
                                <button className="px-5 py-2.5  from-orange-400 to-amber-500
                                text-gray-500 border-2 border-gray-300 rounded-xl duration-300
                                hover:bg-gray-100 font-medium transition-opacity cursor-pointer">
                                    register
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}