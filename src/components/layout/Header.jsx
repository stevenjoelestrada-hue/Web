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
                            onClick={() => setShowLogoutModal(true)}
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

            {showLogoutModal && (
                <div className="modal-overlay" onClick={() => setShowLogoutModal(false)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        background: 'var(--component-bg)', border: '1px solid var(--border-color)',
                        borderRadius: '20px', maxWidth: '400px', width: '90%', padding: '24px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: 'var(--text-main)' }}>¿Cerrar Sesión?</h3>
                        <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            ¿Estás seguro de que quieres cerrar sesión?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                style={{
                                    background: 'transparent', border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '10px',
                                    cursor: 'pointer', fontWeight: '600'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                style={{
                                    background: '#ef4444', border: 'none', color: 'white',
                                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Sí, Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
