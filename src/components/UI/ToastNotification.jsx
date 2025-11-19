import React, { useState, useEffect } from 'react';

const ToastNotification = ({ message, isError, onHide }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onHide, 300);
        }, 3000);
        return () => clearTimeout(timer);
    }, [onHide]);

    // Per spec: Toast Success: bg-green-600, Toast Error: bg-red-600 (No dark mode change)
    const bgColor = isError ? 'bg-red-600' : 'bg-green-600';
    
    return (
        <div 
            className={`toast-notification fixed top-5 right-5 z-[60] px-6 py-3 rounded-lg shadow-lg text-white ${bgColor} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
            {message}
        </div>
    );
};

export default ToastNotification;