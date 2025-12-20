import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';

const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain',
    'video/mp4', 'video/x-msvideo', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/ogg'
];
const MAX_SIZE_MB = 100; // Increased limit for videos

const FileUpload = ({ onUpload }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Tipo de archivo no válido. Solo se permiten Documentos, Imágenes, Videos y Música.';
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return `El archivo es demasiado grande. El tamaño máximo es de ${MAX_SIZE_MB}MB.`;
        }
        return null;
    };

    const handleFile = async (file) => {
        setError(null);
        setSuccess(null);
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploading(true);

        // Simulate Network Request with random failure
        try {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() > 0.95) { // 5% chance of failure
                        reject(new Error('Error de red. Falló la subida del archivo.'));
                    } else {
                        resolve();
                    }
                }, 1500);
            });

            onUpload(file);
            setSuccess(`${file.name} subido exitosamente`);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="upload-section">
            <form
                className={`upload-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="file-input"
                    onChange={handleChange}
                    hidden
                />
                <Upload size={40} className="upload-icon" />
                <p>Arrastra y suelta tus archivos aquí o <span className="highlight">Explorar</span></p>
                <p className="upload-hint">Soporta: Imágenes, Documentos, Videos, Música (Máx {MAX_SIZE_MB}MB)</p>
            </form>

            {uploading && (
                <div className="upload-status uploading">
                    <div className="spinner"></div>
                    <span>Subiendo...</span>
                </div>
            )}

            {error && (
                <div className="upload-status error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="upload-status success">
                    <CheckCircle size={18} />
                    <span>{success}</span>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
