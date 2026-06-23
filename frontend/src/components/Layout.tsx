import { Outlet, Link } from "react-router";

export default function Layout() {
    return (
        <>
            <div className="min-h-screen bg-[#f5f5f0] p-6">
                <header className="bg-white border border-gray-200 rounded-xl mb-6">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link to="/" className="text-xl font-bold text-gray-900">
                            <span className="text-orange-500">//</span> Todo App
                        </Link>
                        
                        <Link to="/profile" className="py-1 px-4 flex text-gray-500 items-center gap-3 duration-100 rounded-2xl hover:bg-amber-100 hover:text-orange-400">
                            <span className="text-sm font-mono">username</span>
                            <button className="w-9 h-9 bg-linear-to-r from-orange-400
                                to-amber-500 rounded-full flex items-center justify-center
                                text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                            U
                            </button>
                        </Link>
                    </div>
                </header>
                
                <main>
                    <Outlet />
                </main>
            </div>
        </>
    )
}