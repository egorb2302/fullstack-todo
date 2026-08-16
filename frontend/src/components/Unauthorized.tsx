import { Link } from 'react-router';
import StandaloneHeader from './StandaloneHeader';

export default function Unauthorized() {
    return (
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6">
            <StandaloneHeader />

            <div className="sheet mt-16 animate-pop-in p-7 text-center sm:p-8">
                <h1 className="text-2xl font-bold text-ink">
                    <span className="font-mono text-accent">//</span> Not signed in
                </h1>
                <p className="comment mt-2">{"// your session is missing or expired"}</p>

                <div className="mt-8 space-y-6">
                    <div>
                        <p className="mb-3 font-mono text-xs text-soft">Log in to open your tasks</p>
                        <Link to="/auth/login" className="btn-accent w-full">
                            login
                        </Link>
                    </div>

                    <div className="border-t border-line pt-6">
                        <p className="mb-3 font-mono text-xs text-soft">New here? Create an account</p>
                        <Link to="/auth/register" className="btn-ghost w-full">
                            register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
