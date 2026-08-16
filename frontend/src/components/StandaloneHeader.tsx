import { Link } from "react-router";
import ThemeToggle from "./ThemeToggle";

/**
 * Шапка для страниц вне общего каркаса: логин, регистрация, профиль, 404.
 * Словарный знак слева, переключатель темы справа.
 */
export default function StandaloneHeader() {
    return (
        <div className="flex items-center justify-between gap-3">
            <Link
                to="/"
                className="font-mono text-sm font-semibold text-ink transition-colors duration-150 hover:text-accent"
            >
                <span className="text-accent">//</span> Todo App
            </Link>
            <ThemeToggle />
        </div>
    );
}
