import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, logout } from "../api/api";
import { useNavigate } from "react-router";
import { usernameOutput } from "../utils/username";
import { Link } from 'react-router';
import Check from "../components/Check";
import ThemeToggle from "../components/ThemeToggle";

export default function Profile() {
    const { data: users , isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: () => getCurrentUser(),
    })
    const nav = useNavigate()

    const logoutHandler = async () => {
        await logout()
        nav('/auth/login')
    }

    return (
        <Check isLoading={isLoading} error={error} data={users}>
            {(users) => (
                <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6">
                    <div className="flex items-center justify-between gap-3">
                        <Link
                            to="/"
                            className="font-mono text-sm text-soft transition-colors duration-150 hover:text-accent"
                        >
                            ← back to home
                        </Link>
                        <ThemeToggle />
                    </div>

                    <div className="sheet mt-14 animate-pop-in p-7 sm:p-8">
                        <p className="crumb">~/profile</p>
                        <h1 className="mt-2 text-3xl font-bold text-ink">
                            <span className="font-mono text-accent">//</span> Profile
                        </h1>

                        <div className="mt-8 flex items-center gap-5">
                            <div
                                className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-accent font-mono text-2xl font-bold text-on-accent"
                                aria-hidden
                            >
                                {usernameOutput(users)}
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-lg font-semibold text-ink">{users.name}</h2>
                                <p className="truncate font-mono text-sm text-soft">{users.email}</p>
                            </div>
                        </div>

                        <dl className="mt-8 border-y border-line">
                            <div className="flex items-baseline justify-between gap-4 py-3.5">
                                <dt className="font-mono text-xs text-faint">id</dt>
                                <dd className="truncate font-mono text-sm text-soft">{users.id}</dd>
                            </div>
                        </dl>

                        <button onClick={logoutHandler} className="btn-danger-ghost mt-8 w-full">
                            logout
                        </button>
                    </div>
                </div>
            )}
        </Check>
    )
}
