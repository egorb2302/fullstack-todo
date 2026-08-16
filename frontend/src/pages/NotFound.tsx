import { Link } from 'react-router';
import StandaloneHeader from '../components/StandaloneHeader';

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6">
            <StandaloneHeader />

            <div className="flex flex-1 flex-col items-center justify-center pb-24 text-center">
                <p className="crumb">~/nowhere</p>
                <h1 className="mt-3 font-mono text-7xl font-bold text-ink sm:text-8xl">
                    <span className="text-accent">//</span> 404
                </h1>
                <h2 className="mt-4 font-mono text-lg text-soft">
                    page not found
                </h2>
                <p className="comment mt-2">{"// this file does not exist"}</p>

                <Link
                    to="/"
                    className="mt-8 font-mono text-sm text-accent transition-colors duration-150 hover:text-accent-deep"
                >
                    back to home →
                </Link>
            </div>
        </div>
    )
}
