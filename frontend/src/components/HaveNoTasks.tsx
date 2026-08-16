import { useState } from 'react';
import Modal from '../components/TaskModal';

export default function NoTasks() {
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)

    const handleModal = async (): Promise<void> => {
        // Модалка сама инвалидирует список после добавления,
        // перезагружать страницу целиком незачем
        setModalIsOpen(false)
    }

    return (
        <section className="sheet animate-pop-in overflow-hidden" aria-label="Empty task list">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 sm:px-5">
                <span className="flex items-center gap-2 font-mono text-xs text-soft">
                    <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
                    tasks
                </span>
                <span className="font-mono text-xs tabular-nums text-faint">0 lines</span>
            </div>

            {/* Пустой файл: первая строка ждёт, каретка мигает */}
            <div className="flex border-b border-line">
                <span className="gutter-cell" aria-hidden>01</span>
                <span className="flex items-center gap-2.5 px-4 py-3.5 sm:px-5">
                    <span className="caret" aria-hidden />
                </span>
            </div>

            <div className="px-6 py-12 text-center">
                <h1 className="text-xl font-bold text-ink">You have no tasks yet!</h1>
                <p className="comment mt-2">{"// the first line is the hardest one"}</p>
                <button
                    className="btn-accent mt-7"
                    onClick={() => setModalIsOpen(true)}
                >
                    + add task
                </button>
            </div>

            {modalIsOpen && <Modal onAccepted={handleModal} onClose={() => setModalIsOpen(false)}/>}
        </section>
    )
}
