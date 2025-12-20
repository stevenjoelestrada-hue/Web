import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showNotification = useCallback(({ type = 'info', message, duration = 7000 }) => {
        const id = Date.now();
        const newToast = { id, type, message, duration };

        setToasts((prev) => {
            // Keep only the last 3 notifications
            const updated = [newToast, ...prev].slice(0, 3);
            return updated;
        });

        // Add to persistent notification center (localStorage)
        const savedNotifications = JSON.parse(localStorage.getItem('fv_notifications') || '[]');
        const persistentNotif = {
            id,
            message,
            type,
            time: 'Hace un momento',
            read: false,
            priority: type === 'error' || type === 'warning'
        };
        const updatedPersistent = [persistentNotif, ...savedNotifications].slice(0, 50); // Keep last 50
        localStorage.setItem('fv_notifications', JSON.stringify(updatedPersistent));

        // Dispatch event for components that need to know immediately (like Header badge)
        window.dispatchEvent(new CustomEvent('fv-notification-added'));

        if (duration !== Infinity) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeNotification(toast.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

const Toast = ({ type, message, onClose }) => {
    const icons = {
        success: <CheckCircle className="toast-icon success" size={20} />,
        warning: <AlertTriangle className="toast-icon warning" size={20} />,
        error: <AlertCircle className="toast-icon error" size={20} />,
        info: <Info className="toast-icon info" size={20} />
    };

    return (
        <div className={`toast-item ${type} animate-slide-in`}>
            <div className="toast-content">
                {icons[type]}
                <span className="toast-message">{message}</span>
            </div>
            <button className="toast-close" onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
};
