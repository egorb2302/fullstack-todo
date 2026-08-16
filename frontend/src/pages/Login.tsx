import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
import { Link, useNavigate } from 'react-router'
import { login } from "../api/api";
import StandaloneHeader from "../components/StandaloneHeader";

const loginSchema = z.object({
    email: string(),
    password: string().min(6, "Password needs at least 6 characters")
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
            nav('/todos')
        } catch (err) {
            console.error(err)
            return
        }
    }

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6">
            <StandaloneHeader />

            <div className="sheet mt-14 animate-pop-in p-7 sm:mt-20 sm:p-8">
                <p className="crumb">~/auth/login</p>
                <h1 className="mt-2 text-3xl font-bold text-ink">
                    <span className="font-mono text-accent">//</span> Login
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                    <div>
                        <label htmlFor="email" className="mb-1.5 block font-mono text-xs text-soft">Email</label>
                        <input
                            id="email"
                            {...register('email')}
                            autoComplete="email"
                            className="field"
                        />
                        {errors.email && <span className="mt-1.5 block font-mono text-xs text-danger">{errors.email.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1.5 block font-mono text-xs text-soft">Password</label>
                        <input
                            id="password"
                            {...register('password')}
                            type="password"
                            autoComplete="current-password"
                            className="field"
                        />
                        {errors.password && <span className="mt-1.5 block font-mono text-xs text-danger">{errors.password.message}</span>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-accent w-full">
                        {isSubmitting ? "Login..." : "Login"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/auth/register"
                        className="font-mono text-sm text-accent transition-colors duration-150 hover:text-accent-deep"
                    >
                        No account yet? Sign up →
                    </Link>
                </div>
            </div>
        </div>
    )
}
