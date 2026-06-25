import { Link } from 'react-router';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#f5f5f0] flex justify-center p-6">
            <div className="w-full max-w-md mt-20">
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                    <h1 className="text-8xl font-bold text-gray-900 mb-4">
                        <span className="text-orange-500">//</span> 404
                    </h1>
                    <h2 className="text-xl text-gray-600 mb-8 font-mono">
                        page not found
                    </h2>
                    
                    <div className="flex justify-center">
                        <Link 
                            to="/" 
                            className="text-orange-500 hover:text-orange-600 text-sm font-mono transition-colors"
                        >
                            back to home →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}