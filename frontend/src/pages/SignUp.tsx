import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().optional(),
    email: z.string(),
    password: z.string().min(6, "Min length fror password is 6 chars"),
    confirmPass: z.string()
}).refine(data => data.password === data.confirmPass,
    { message: "Passwords is compare", path: ['confirmPass']}
)

type RegisterType = z.infer<typeof registerSchema>

export default function Signup() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterType>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: RegisterType) => {
        console.log('Submitting was successfull!', data)
    }

    return (
        <div className="min-h-screen bg-[#f5f5f0] flex justify-center p-6">
            <div className="w-full max-w-md mt-20">
                <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        <span className="text-orange-500">//</span> Register
                    </h1>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-mono text-gray-700 mb-1">Name:</label>
                            <input 
                                {...register('name')} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all text-gray-900"
                            />
                            {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name.message}</span>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-mono text-gray-700 mb-1">Email:</label>
                            <input 
                                {...register('email')} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all text-gray-900"
                            />
                            {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email.message}</span>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-mono text-gray-700 mb-1">Password:</label>
                            <input 
                                {...register('password')} 
                                type="password"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all text-gray-900"
                            />
                            {errors.password && <span className="text-red-500 text-sm mt-1 block">{errors.password.message}</span>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-mono text-gray-700 mb-1">Confirm password:</label>
                            <input 
                                {...register('confirmPass')} 
                                type="password"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all text-gray-900"
                            />
                            {errors.confirmPass && <span className="text-red-500 text-sm mt-1 block">{errors.confirmPass.message}</span>}
                        </div>

                        <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full px-5 py-2.5 bg-linear-to-r from-orange-400 to-amber-500 text-white rounded-xl 
                        hover:opacity-90 font-medium transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                        {isSubmitting ? "Register..." : "Register"}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <Link to="/auth/login" className="text-orange-500 hover:text-orange-600 text-sm font-mono transition-colors">
                        already have account? Login →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}