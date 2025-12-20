import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

const CreateFolderModal = ({ onClose, onCreate }) => {
    const [folderName, setFolderName] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!folderName.trim()) {
            setError('El nombre no puede estar vacío');
            return;
        }

        const success = onCreate(folderName);
        if (success) {
            onClose();
        } else {
            // Error is handled/set by useFileManager mostly, but we can set local error if needed
            // If createFolder returns false, it usually sets the main app error.
            // But we can also set local error if we want specific feedback here.
            // For now, let's assume onCreate returns boolean success.
        }
    };

    return (
        <div className="preview-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="welcome-card" style={{ maxWidth: '400px', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FolderPlus size={24} color="var(--primary-color)" />
                        Nueva Carpeta
                    </h3>
                    <button onClick={onClose} className="icon-btn">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="welcome-form">
                    <div className="input-group">
                        <label>Nombre de la carpeta</label>
                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) => {
                                setFolderName(e.target.value);
                                setError(null);
                            }}
                            placeholder="Ej. Documentos de Trabajo"
                            autoFocus
                        />
                        {error && <span className="error-msg">{error}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="start-btn" style={{ flex: 1, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="start-btn" style={{ flex: 1 }}>
                            Crear Carpeta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;
