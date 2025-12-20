import React from 'react';
import { Bell, ShieldCheck } from 'lucide-react';

const NotificationPermissionModal = ({ onAccept, onDecline }) => {
    return (
        <div className="modal-overlay">
            <div className="permission-modal">
                <div className="permission-modal-header">
                    <div className="permission-icon-wrapper">
                        <Bell size={32} className="icon-blue" />
                    </div>
                    <h2>Activar Notificaciones</h2>
                </div>
                <div className="permission-modal-body">
                    <p>FileVault quiere enviarte notificaciones para mantenerte al tanto de:</p>
                    <ul>
                        <li>
                            <ShieldCheck size={16} className="icon-green" />
                            <span>Guardado exitoso de archivos y notas</span>
                        </li>
                        <li>
                            <ShieldCheck size={16} className="icon-yellow" />
                            <span>Alertas de almacenamiento y seguridad</span>
                        </li>
                        <li>
                            <ShieldCheck size={16} className="icon-blue" />
                            <span>Recordatorios y actividad relevante</span>
                        </li>
                    </ul>
                    <p className="permission-note">
                        Podrás configurar qué notificaciones recibir desde los ajustes en cualquier momento.
                    </p>
                </div>
                <div className="permission-modal-footer">
                    <button className="btn-secondary" onClick={onDecline}>Ahora no</button>
                    <button className="btn-primary" onClick={onAccept}>Permitir notificaciones</button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPermissionModal;
