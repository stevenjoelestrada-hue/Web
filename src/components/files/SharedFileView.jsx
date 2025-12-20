import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, Clock, Image, Video, Music, Play, AlertCircle } from 'lucide-react';

const SharedFileView = () => {
    const { linkId } = useParams();
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking backend verification with localStorage
        const fetchSharedFile = () => {
            try {
                const storedShares = JSON.parse(localStorage.getItem('file-manager-shares') || '[]');
                const share = storedShares.find(s => s.linkId === linkId);

                if (!share) {
                    setError('Este enlace no es válido o ha sido eliminado.');
                    setLoading(false);
                    return;
                }

                // Check expiration
                if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
                    setError('Este enlace ha expirado.');
                    setLoading(false);
                    return;
                }

                // Increment view count (optional for demo)
                // updateViewCount(share.linkId);

                // Find the actual file (in a real app, this would be a backend call)
                // We need to access the stored files from the same localStorage
                const storedFiles = JSON.parse(localStorage.getItem('file-manager-files') || '[]');
                const foundFile = storedFiles.find(f => f.id === share.fileId);

                if (foundFile) {
                    setFile(foundFile);
                } else {
                    setError('El archivo compartido ya no existe.');
                }
            } catch (err) {
                console.error(err);
                setError('Error al cargar el archivo.');
            } finally {
                setLoading(false);
            }
        };

        fetchSharedFile();
    }, [linkId]);

    const handleDownload = () => {
        if (!file?.url) return;
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Cargando...</div>;

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', padding: '2rem', textAlign: 'center' }}>
                <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Enlace no disponible</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error}</p>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Ir a FileVault</Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            <header style={{ height: '64px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <circle cx="12" cy="12" r="6" />
                            <path d="M12 12h3" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>FileVault Shared</h2>
                </div>
            </header>

            <main style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                        {file.type.startsWith('image/') ? (
                            <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ width: '120px', height: '120px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={64} color="#3b82f6" />
                            </div>
                        )}
                    </div>

                    <h1 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.5rem' }}>{file.name}</h1>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>{file.size} • Compartido hace poco</p>

                    <button
                        onClick={handleDownload}
                        style={{
                            background: '#3b82f6', color: '#fff', border: 'none', padding: '0.8rem 2rem',
                            borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
                        }}
                    >
                        <Download size={20} />
                        Descargar Archivo
                    </button>
                </div>
            </main>
        </div>
    );
};

export default SharedFileView;
