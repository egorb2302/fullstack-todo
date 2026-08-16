import { Outlet, Link } from "react-router";
import { getCurrentUser } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { usernameOutput } from "../utils/username";
import Check from "./Check";
import ThemeToggle from "./ThemeToggle";

export default function Layout() {
    const { data: users, isLoading, error } = useQuery({
        queryKey: ["users"],
        queryFn: () => getCurrentUser(),
    });

    return (
        <Check isLoading={isLoading} error={error} data={users}>
            {(users) => (
                <div className="min-h-screen">
                    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
                        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4 sm:px-6">
                            <Link
                                to="/"
                                className="font-mono text-[0.9375rem] font-semibold text-ink transition-colors duration-150 hover:text-accent"
                            >
                                <span className="text-accent">//</span> Todo App
                            </Link>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <ThemeToggle />
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2.5 rounded-lg py-1 pl-2.5 pr-1 transition-colors duration-150 hover:bg-bg"
                                >
                                    <span className="hidden font-mono text-sm text-soft sm:inline">
                                        {users.name}
                                    </span>
                                    <span
                                        className="grid h-9 w-9 place-items-center rounded-md bg-accent font-mono text-xs font-semibold text-on-accent"
                                        aria-hidden
                                    >
                                        {usernameOutput(users)}
                                    </span>
                                    <span className="sr-only">Open profile</span>
                                </Link>
                            </div>
                        </div>
                    </header>

                    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
                        <Outlet />
                    </main>
                </div>
            )}
        </Check>
    );
}
