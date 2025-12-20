import React from 'react';
import { Bell, Check, Info, AlertTriangle, XCircle, Trash2, X } from 'lucide-react';

const NotificationPanel = ({ notifications, onMarkAsRead, onClearAll, onClose }) => {
    return (
        <div className="notification-panel">
            <div className="notification-header">
                <h3>Notificaciones</h3>
                <div className="notification-header-actions">
                    <button className="clear-all-btn" onClick={onClearAll} title="Limpiar todas">
                        <Trash2 size={16} />
                    </button>
                    <button className="close-panel-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="empty-notifications">
                        <div className="empty-icon">🔔</div>
                        <p>Todo al día</p>
                        <span>No tienes notificaciones nuevas</span>
                    </div>
                ) : (
                    <>
                        {notifications.some(n => n.priority && !n.read) && (
                            <div className="notification-section">
                                <span className="section-label">IMPORTANTE</span>
                                {notifications.filter(n => n.priority && !n.read).map(notif => (
                                    <NotificationItem key={notif.id} notif={notif} onMarkAsRead={onMarkAsRead} />
                                ))}
                            </div>
                        )}

                        <div className="notification-section">
                            <span className="section-label">{notifications.some(n => n.priority && !n.read) ? 'OTRAS' : 'RECIENTES'}</span>
                            {notifications.filter(n => !(n.priority && !n.read)).map(notif => (
                                <NotificationItem key={notif.id} notif={notif} onMarkAsRead={onMarkAsRead} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const NotificationItem = ({ notif, onMarkAsRead }) => (
    <div className={`notification-item ${notif.read ? 'read' : 'unread'} ${notif.priority ? 'priority' : ''}`}>
        <div className={`notification-icon ${notif.type}`}>
            {notif.type === 'success' && <Check size={16} />}
            {notif.type === 'info' && <Info size={16} />}
            {notif.type === 'warning' && <AlertTriangle size={16} />}
            {notif.type === 'error' && <XCircle size={16} />}
        </div>
        <div className="notification-content" onClick={() => onMarkAsRead(notif.id)}>
            <p className="notification-message">{notif.message}</p>
            <span className="notification-time">{notif.time}</span>
        </div>
        {!notif.read && <div className="unread-dot"></div>}
    </div>
);

export default NotificationPanel;
