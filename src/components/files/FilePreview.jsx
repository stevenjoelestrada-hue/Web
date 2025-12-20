import React from 'react';
import { X, Download, FileText, AlertCircle } from 'lucide-react';

const FilePreview = ({ file, onClose }) => {
    if (!file) return null;

    const renderContent = () => {
        const src = file.supabaseUrl || file.data;

        if (!src) {
            return (
                <div className="preview-fallback">
                    <AlertCircle size={48} className="text-error" />
                    <p>Contenido no disponible</p>
                </div>
            );
        }

        const type = file.type.toLowerCase();

        if (type.startsWith('image/')) {
            return <img src={src} alt={file.name} className="preview-image" />;
        }

        if (type.startsWith('video/')) {
            return <video src={src} controls autoPlay className="preview-video" />;
        }

        if (type.startsWith('audio/')) {
            return (
                <div className="preview-audio">
                    <div className="audio-icon-wrapper">
                        <FileText size={64} />
                    </div>
                    <audio src={src} controls autoPlay className="w-full" />
                </div>
            );
        }

        if (type === 'application/pdf') {
            return <iframe src={src} title={file.name} className="preview-frame" />;
        }

        return (
            <div className="preview-fallback">
                <FileText size={64} />
                <p>Vista previa no disponible para este tipo de archivo.</p>
            </div>
        );
    };

    return (
        <div className="preview-overlay" onClick={onClose}>
            <div className="preview-modal" onClick={e => e.stopPropagation()}>
                <div className="preview-header">
                    <h3>{file.name}</h3>
                    <div className="preview-actions">
                        <a
                            href={file.supabaseUrl || file.data}
                            download={file.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="preview-btn download"
                            title="Descargar"
                        >
                            <Download size={20} />
                        </a>
                        <button onClick={onClose} className="preview-btn close" title="Cerrar">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="preview-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default FilePreview;
