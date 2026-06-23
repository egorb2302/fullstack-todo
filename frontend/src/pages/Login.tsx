import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
import { Link, useNavigate } from 'react-router'
import { login } from "../api/api";

const loginSchema = z.object({
    email: string(),
    password: string().min(6, "Min length of password is 6 chars")
})

export type LoginType = z.infer<typeof loginSchema>

export default function Login() {
    const { register, handleSubmit, formState: { errors, isSubmitting }} = useForm<LoginType>({
        resolver: zodResolver(loginSchema)
    })
    const nav = useNavigate();

    const onSubmit = async (data: LoginType): Promise<void> => {
        try {
            const { email, password } = data
            if (!email || !password) {
                console.log("No email or password")
                return 
            }
            
            await login(data)
            console.log("Successfull login", data)
            nav('/todos')
        } catch (err) {
            console.error(err)
            return
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f5f0] flex justify-center p-6">
            <div className="w-full max-w-md mt-20">
                <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        <span className="text-orange-500">//</span> Login
                    </h1>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                        <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full px-5 py-2.5 bg-linear-to-r from-orange-400 to-amber-500 text-white rounded-xl 
                        hover:opacity-90 font-medium transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {isSubmitting ? "Login..." : "Login"}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <Link to="/auth/register" className="text-orange-500 hover:text-orange-600 text-sm font-mono transition-colors">
                        have not account yet? Sign Up →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}