import type { GuardProps } from "../types/types";
import Unauthorized from '../components/Unauthorized';

export default function Check<T>({isLoading, error, data, children}: GuardProps<T>) {
        if (isLoading) {
                return (
                        <div className="flex min-h-[60vh] items-center justify-center">
                                <div className="flex items-center gap-3 font-mono text-sm text-soft">
                                        <span className="caret" aria-hidden />
                                        Loading...
                                </div>
                        </div>
                );
        }

        if (error) {
            console.log(error)
            return (
                <div className="mx-auto w-full max-w-md px-4 py-16">
                    <div className="sheet animate-pop-in border-danger/30 p-7 text-center">
                        <h3 className="text-xl font-bold text-ink">Oops! Something went wrong</h3>
                        <p className="comment mt-2">{`// ${error.message}`}</p>
                        <button
                            className="btn-accent mt-6"
                            onClick={() => window.location.reload()}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        if (!data) return <Unauthorized />

        return <>{children(data)}</>
}
