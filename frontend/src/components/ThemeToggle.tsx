import { useState } from "react";

type Theme = "light" | "dark";

const readTheme = (): Theme =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/**
 * Переключатель цветовой схемы в духе строки состояния редактора:
 * два текстовых сегмента вместо солнца и луны, активный подсвечен.
 *
 * Атрибут data-theme на <html> — единственный источник правды, его же
 * читает инлайн-скрипт в index.html при следующей загрузке.
 */
export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(readTheme);

    const toggle = () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        const root = document.documentElement;
        root.dataset.theme = next;
        try {
            localStorage.setItem("theme", next);
        } catch {
            /* приватный режим без localStorage — тема просто не переживёт перезагрузку */
        }
        // Короткий кросс-фейд только на время переключения, см. index.css
        root.setAttribute("data-theme-anim", "");
        window.setTimeout(() => root.removeAttribute("data-theme-anim"), 350);
        setTheme(next);
    };

    const segment = "rounded-md px-2 py-1 transition-colors duration-150";

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-9 cursor-pointer items-center gap-0.5 rounded-lg border border-line bg-bg p-0.5 font-mono text-[0.6875rem]"
        >
            <span
                aria-hidden
                className={`${segment} ${theme === "light" ? "bg-surface text-ink shadow-sm" : "text-faint"}`}
            >
                light
            </span>
            <span
                aria-hidden
                className={`${segment} ${theme === "dark" ? "bg-surface text-ink shadow-sm" : "text-faint"}`}
            >
                dark
            </span>
        </button>
    );
}
