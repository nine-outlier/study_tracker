import React, { useState, useEffect } from 'react';

const ConfirmModal = ({ title, message, onConfirm, onCancel, isVisible }) => {
    
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [isVisible]);
    
    if (!isVisible) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`} 
            onClick={onCancel}
        >
            <div 
                className={`bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 dark:bg-gray-900 dark:ring-gray-800 transform transition-all duration-200 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{message}</p>
                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;