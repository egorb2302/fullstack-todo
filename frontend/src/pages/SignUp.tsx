import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { registerAPI } from "../api/api";
import StandaloneHeader from "../components/StandaloneHeader";

const registerSchema = z.object({
    name: z.string().optional(),
    email: z.string(),
    password: z.string().min(6, "Password needs at least 6 characters"),
    confirmPass: z.string()
}).refine(data => data.password === data.confirmPass,
    { message: "Passwords do not match", path: ['confirmPass']}
)

export type RegisterType = z.infer<typeof registerSchema>
export type RegisterRequest = Omit<RegisterType, 'confirmPass'>;

export default function Signup() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterType>({
        resolver: zodResolver(registerSchema)
    })

    const nav = useNavigate()
    const onSubmit = async (data: RegisterRequest) => {
        try {
            const { name, email, password } = data
            await registerAPI({name, email, password})
            nav('/auth/login')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6">
            <StandaloneHeader />

            <div className="sheet mt-10 animate-pop-in p-7 sm:mt-14 sm:p-8">
                <p className="crumb">~/auth/register</p>
                <h1 className="mt-2 text-3xl font-bold text-ink">
                    <span className="font-mono text-accent">//</span> Register
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                    <div>
                        <label htmlFor="name" className="mb-1.5 block font-mono text-xs text-soft">Name</label>
                        <input
                            id="name"
                            {...register('name')}
                            autoComplete="name"
                            className="field"
                        />
                        {errors.name && <span className="mt-1.5 block font-mono text-xs text-danger">{errors.name.message}</span>}
                    </div>

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
                            autoComplete="new-password"
                            className="field"
                        />
                        {errors.password && <span className="mt-1.5 block font-mono text-xs text-danger">{errors.password.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="confirmPass" className="mb-1.5 block font-mono text-xs text-soft">Confirm password</label>
                        <input
                            id="confirmPass"
                            {...register('confirmPass')}
                            type="password"
                            autoComplete="new-password"
                            className="field"
                        />
                        {errors.confirmPass && <span className="mt-1.5 block font-mono text-xs text-danger">{errors.confirmPass.message}</span>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-accent mt-1 w-full">
                        {isSubmitting ? "Register..." : "Register"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/auth/login"
                        className="font-mono text-sm text-accent transition-colors duration-150 hover:text-accent-deep"
                    >
                        Already have account? Login →
                    </Link>
                </div>
            </div>
        </div>
    )
}
