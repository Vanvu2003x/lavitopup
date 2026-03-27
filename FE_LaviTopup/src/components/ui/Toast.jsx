"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { FiCheck, FiX, FiAlertCircle, FiInfo } from "react-icons/fi";

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
};

const ToastItem = ({ id, message, type, onClose }) => {
    const icons = {
        success: <FiCheck className="w-4 h-4" />,
        error: <FiX className="w-4 h-4" />,
        warning: <FiAlertCircle className="w-4 h-4" />,
        info: <FiInfo className="w-4 h-4" />
    };

    const styles = {
        success: "border-l-4 border-l-emerald-500",
        error: "border-l-4 border-l-red-500",
        warning: "border-l-4 border-l-amber-500",
        info: "border-l-4 border-l-blue-500"
    };

    const iconStyles = {
        success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        error: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    };

    return (
        <div
            className={`
                flex items-center gap-4 min-w-[300px] max-w-sm p-4
                bg-white dark:bg-[#1e1e2e]
                rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                border border-gray-100 dark:border-gray-800
                ${styles[type]}
                animate-[slideIn_0.3s_ease-out]
                group transition-all hover:translate-x-[-4px]
            `}
        >
            {/* Icon */}
            <div className={`p-2 rounded-full flex-shrink-0 ${iconStyles[type]}`}>
                {icons[type]}
            </div>

            {/* Message */}
            <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {type === "success" && "Thành công"}
                    {type === "error" && "Thất bại"}
                    {type === "warning" && "Cảnh báo"}
                    {type === "info" && "Thông báo"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium leading-relaxed">
                    {message}
                </p>
            </div>

            {/* Close button */}
            <button
                onClick={() => onClose(id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors opacity-0 group-hover:opacity-100"
            >
                <FiX className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "info") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (message) => showToast(message, "success"),
        error: (message) => showToast(message, "error"),
        warning: (message) => showToast(message, "warning"),
        warn: (message) => showToast(message, "warning"), // Alias
        info: (message) => showToast(message, "info")
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto cursor-pointer" onClick={() => removeToast(toast.id)}>
                        <ToastItem
                            id={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={removeToast}
                        />
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
