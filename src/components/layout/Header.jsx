import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Sun, Moon, X, LogOut, Menu } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useNotification } from '../../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import NotificationPermissionModal from './NotificationPermissionModal';

const Header = ({ user, onLogout, searchQuery, onSearch, onOpenMobileMenu }) => {
    const { theme, toggleTheme } = useTheme();
    const { showNotification } = useNotification();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [profilePicture, setProfilePicture] = useState(localStorage.getItem('userProfilePicture') || '');

    useEffect(() => {
        const handleStorageChange = () => {
            const photo = localStorage.getItem('userProfilePicture');
            setProfilePicture(photo || '');
        };

        const loadNotifications = () => {
            const savedNotifications = JSON.parse(localStorage.getItem('fv_notifications') || '[]');
            setNotifications(savedNotifications);
            setHasUnread(savedNotifications.some(n => !n.read));
        };

        // Initial load
        const savedPhoto = localStorage.getItem('userProfilePicture');
        if (savedPhoto) setProfilePicture(savedPhoto);
        loadNotifications();

        window.addEventListener('profileUpdated', handleStorageChange);
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('fv-notification-added', loadNotifications);

        return () => {
            window.removeEventListener('profileUpdated', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('fv-notification-added', loadNotifications);
        };
    }, []);
    const handleBellClick = () => {
        const permission = Notification.permission;
        const modalShown = localStorage.getItem('fv_notif_modal_shown');

        // Only show modal on first interaction if permission not yet decided
        if (permission === 'default' && !modalShown) {
            setShowPermissionModal(true);
            localStorage.setItem('fv_notif_modal_shown', 'true');
        } else {
            // Directly show notifications panel
            setShowNotifications(!showNotifications);
        }
    };

    const handleAcceptPermission = async () => {
        const permission = await Notification.requestPermission();
        setShowPermissionModal(false);
        if (permission === 'granted') {
            showNotification({
                type: 'success',
                message: '¡Notificaciones activadas!'
            });
        }
        // Open notifications panel after accepting
        setShowNotifications(true);
    };

    const handleRejectPermission = () => {
        setShowPermissionModal(false);
        // Still open notifications panel to show existing notifications
        setShowNotifications(true);
    };

    const handleThemeToggle = () => {
        toggleTheme();
        showNotification({
            type: 'info',
            message: `Tema cambiado a modo ${theme === 'light' ? 'oscuro' : 'claro'}`
        });
    };

    const markAsRead = (id) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        setHasUnread(updated.some(n => !n.read));
        localStorage.setItem('fv_notifications', JSON.stringify(updated));
    };

    const clearAll = () => {
        setNotifications([]);
        setHasUnread(false);
        localStorage.setItem('fv_notifications', '[]');
    };

    return (
        <header className="app-header">
            <button className="mobile-menu-btn" onClick={onOpenMobileMenu}>
                <Menu size={24} />
            </button>
            <div className="search-bar">
                <Search size={20} className="search-icon icon-colorful icon-blue" />
                <input
                    type="text"
                    placeholder="Buscar archivos..."
                    value={searchQuery || ''}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearch('')}
                        className="icon-interactive red"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="header-actions">
                <button
                    className="icon-btn icon-interactive blue"
                    onClick={handleThemeToggle}
                    title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                >
                    {theme === 'light' ? <Moon size={20} className="icon-colorful icon-blue" /> : <Sun size={20} className="icon-colorful icon-yellow" />}
                </button>

                <button
                    className={`icon-btn icon-interactive ${hasUnread ? 'yellow' : 'blue'}`}
                    onClick={handleBellClick}
                >
                    <div className="bell-wrapper">
                        <Bell size={20} className="icon-colorful" />
                        {hasUnread && <div className="bell-badge"></div>}
                    </div>
                </button>

                {showNotifications && (
                    <NotificationPanel
                        notifications={notifications}
                        onMarkAsRead={markAsRead}
                        onClearAll={clearAll}
                        onClose={() => setShowNotifications(false)}
                    />
                )}

                {showPermissionModal && (
                    <NotificationPermissionModal
                        onAccept={handleAcceptPermission}
                        onDecline={handleRejectPermission}
                    />
                )}

                {user ? (
                    <>
                        <div className="user-info-badge">
                            <span className="user-name">
                                {user.displayName || 'Usuario'}
                            </span>
                            <span className="user-email">
                                {user.email}
                            </span>
                        </div>
                        {profilePicture || user.photoURL ? (
                            <img src={profilePicture || user.photoURL} alt="Profile" className="avatar" style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className="avatar">
                                <User size={20} />
                            </div>
                        )}
                        <button
                            className="icon-btn icon-interactive red"
                            onClick={onLogout}
                            title="Cerrar Sesión"
                            style={{ marginLeft: '0.5rem' }}
                        >
                            <LogOut size={20} />
                        </button>
                    </>
                ) : (
                    <div className="avatar">
                        <User size={20} />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
