import React, { useState } from 'react';

const Uploader = ({ onUpload }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Por favor, selecciona un archivo primero.');
            return;
        }

        if (!onUpload) {
            setMessage('Error de configuración: no se proporcionó función de subida.');
            return;
        }

        setUploading(true);
        setMessage('Subiendo...');

        try {
            const success = await onUpload(file);

            if (success) {
                setMessage('✅ Archivo subido exitosamente.');
                setFile(null);
            } else {
                // The onUpload function handles setting its own error, but we can show a generic one here
                // assuming if it returns false it failed.
                // However, look at useFileManager: it returns true/false.
                // It also sets 'error' state in the hook, but we don't see that here unless passed.
                // We'll trust the user sees the error on the main screen if it updates that state,
                // or we can assume failure if false.
                setMessage('❌ Error en la subida.');
            }

        } catch (error) {
            console.error('Error al subir el archivo:', error);
            setMessage(`❌ Error en la subida: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="uploader-container" style={{ padding: '1rem', border: '2px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', background: 'var(--hover-bg)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Subir Archivo</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Arrastra archivos aquí o haz clic para seleccionar</p>
            <input
                type="file"
                id="file-input"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
            />
            <label
                htmlFor="file-input"
                className="btn-primary"
                style={{ display: 'inline-block', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
            >
                {uploading ? 'Cargando...' : 'Seleccionar Archivo'}
            </label>

            {file && !uploading && (
                <div style={{ marginTop: '1rem' }}>
                    <p>Archivo seleccionado: <strong>{file.name}</strong></p>
                    <button onClick={handleUpload} className="btn-primary" style={{ marginTop: '0.5rem' }}>Confirmar Subida</button>
                </div>
            )}

            {message && <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: message.includes('❌') ? 'var(--error-color)' : 'var(--success-color)' }}>{message}</p>}
        </div>
    );
};

export default Uploader;
