import { useState } from 'react';
import Modal from '../components/TaskModal';

export default function NoTasks() {
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)

    const handleModal = async (): Promise<void> => {
        setModalIsOpen(false)
        location.reload()
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-6">
                <span className="text-orange-500">//</span> You have no tasks yet!
            </h1>
            <button 
                className="px-5 py-2.5 bg-linear-to-r from-orange-400 to-amber-500 text-white rounded-xl 
                hover:opacity-90 font-medium transition-opacity cursor-pointer"
                onClick={() => setModalIsOpen(true)}
            >
                + add task
            </button>
            {modalIsOpen && <Modal onAccepted={handleModal} onClose={() => setModalIsOpen(false)}/>}
        </div>
        
    )
}