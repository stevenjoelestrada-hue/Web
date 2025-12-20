import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Save, LogOut, ChevronLeft } from 'lucide-react';
import { supabase } from '../../supabase';
import { useNotification } from '../../context/NotificationContext';

const Settings = ({ user, onLogout, onSelectCategory }) => {
    const { showNotification } = useNotification();
    const [profile, setProfile] = useState({
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        profilePhoto: localStorage.getItem('userProfilePicture') || user?.user_metadata?.avatar_url || ''
    });
    const [previewUrl, setPreviewUrl] = useState(localStorage.getItem('userProfilePicture') || user?.user_metadata?.avatar_url || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [notifPrefs, setNotifPrefs] = useState({
        successNotes: true,
        storageAlerts: true,
        activity: true,
        security: true
    });

    useEffect(() => {
        const savedPhoto = localStorage.getItem('userProfilePicture');
        if (savedPhoto) {
            setProfile(prev => ({ ...prev, profilePhoto: savedPhoto }));
            setPreviewUrl(savedPhoto);
        }

        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            setProfile(prev => ({
                ...prev,
                name: parsed.name || user?.user_metadata?.full_name || '',
            }));
        }

        const savedPrefs = localStorage.getItem('fv_notif_prefs');
        if (savedPrefs) {
            setNotifPrefs(JSON.parse(savedPrefs));
        }
    }, [user]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 500 * 1024) {
            alert('La imagen es demasiado grande. Máximo 500KB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setPreviewUrl(base64);
            setProfile(prev => ({ ...prev, profilePhoto: base64 }));
            localStorage.setItem('userProfilePicture', base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!profile.name.trim()) {
            alert('Por favor ingresa un nombre.');
            return;
        }

        setIsSaving(true);
        localStorage.setItem('user_profile', JSON.stringify({ name: profile.name, email: profile.email }));
        localStorage.setItem('userProfilePicture', profile.profilePhoto);
        localStorage.setItem('fv_notif_prefs', JSON.stringify(notifPrefs));

        // Dispatch custom event to notify other components (like Header)
        window.dispatchEvent(new Event('profileUpdated'));
        window.dispatchEvent(new Event('storage'));

        showNotification({ type: 'success', message: 'Configuración guardada correctamente' });

        setTimeout(() => {
            setIsSaving(false);
        }, 500);
    };

    const handleNotifToggle = (key) => {
        setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const confirmLogout = () => {
        onLogout();
        setShowLogoutConfirm(false);
        showNotification({ type: 'info', message: 'Sesión cerrada correctamente' });
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-header">
                    <button className="back-btn icon-interactive blue" onClick={() => onSelectCategory('dashboard')}>
                        <ChevronLeft size={20} className="icon-colorful" />
                    </button>
                    <h2>⚙️ Configuración</h2>
                </div>

                <div className="settings-card">
                    <h3 className="section-title">Perfil</h3>

                    <div className="profile-photo-section">
                        <div className="profile-photo-wrapper">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="profile-preview-img" />
                            ) : (
                                <div className="profile-placeholder">
                                    <User size={48} />
                                </div>
                            )}
                            <label className="photo-upload-label">
                                <Camera size={16} />
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handlePhotoChange}
                                    hidden
                                />
                            </label>
                        </div>
                        <p className="photo-hint">Máximo 500KB. JPG, PNG o GIF.</p>
                    </div>

                    <div className="form-group">
                        <label>Nombre:</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Tu nombre"
                            className="settings-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="text"
                            value={profile.email}
                            readOnly
                            className="settings-input disabled"
                        />
                    </div>

                    <button
                        className="btn-primary icon-interactive blue"
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        <Save size={18} style={{ marginRight: '8px' }} />
                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>

                <div className="settings-card">
                    <h3 className="section-title">Notificaciones</h3>
                    <div className="notif-settings-list">
                        <div className="notif-setting-item">
                            <div className="notif-setting-info">
                                <span>Guardado de notas</span>
                                <p>Recibir avisos al guardar o actualizar notas</p>
                            </div>
                            <label className="switch-label">
                                <input
                                    type="checkbox"
                                    checked={notifPrefs.successNotes}
                                    onChange={() => handleNotifToggle('successNotes')}
                                />
                            </label>
                        </div>

                        <div className="notif-setting-item">
                            <div className="notif-setting-info">
                                <span>Alertas de almacenamiento</span>
                                <p>Notificar cuando el espacio esté por llenarse</p>
                            </div>
                            <label className="switch-label">
                                <input
                                    type="checkbox"
                                    checked={notifPrefs.storageAlerts}
                                    onChange={() => handleNotifToggle('storageAlerts')}
                                />
                            </label>
                        </div>

                        <div className="notif-setting-item">
                            <div className="notif-setting-info">
                                <span>Actividad del sistema</span>
                                <p>Cambios críticos y actualizaciones importantes</p>
                            </div>
                            <label className="switch-label">
                                <input
                                    type="checkbox"
                                    checked={notifPrefs.activity}
                                    onChange={() => handleNotifToggle('activity')}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="settings-card logout-card" style={{ marginTop: '2rem' }}>
                    <h3 className="section-title">Cuenta</h3>
                    <button
                        className="btn-danger"
                        onClick={() => setShowLogoutConfirm(true)}
                        style={{ width: '100%' }}
                    >
                        <LogOut size={18} style={{ marginRight: '8px' }} />
                        🚪 Cerrar sesión
                    </button>
                </div>
            </div>

            {showLogoutConfirm && (
                <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <h3>¿Cerrar Sesión?</h3>
                        <p>¿Estás seguro de que quieres cerrar sesión?</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                            <button className="btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
                            <button className="btn-danger" onClick={confirmLogout}>Sí, Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
