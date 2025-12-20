import { Link, Copy, Check, Clock, Globe } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ShareModal = ({ file, onClose, onCreateLink }) => {
    const [link, setLink] = useState('');
    const [copied, setCopied] = useState(false);
    const { showNotification } = useNotification();
    const [duration, setDuration] = useState('24h');

    useEffect(() => {
        // Generate link on mount
        const linkId = onCreateLink(file.id);
        const url = `${window.location.origin}/share/${linkId}`;
        setLink(url);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        showNotification({ type: 'success', message: 'Enlace copiado al portapapeles' });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="preview-overlay" onClick={onClose}>
            <div className="preview-modal" style={{ maxWidth: '500px', height: 'auto', padding: '0' }} onClick={e => e.stopPropagation()}>
                <div className="preview-header">
                    <h3>Compartir Archivo</h3>
                    <button className="preview-btn" onClick={onClose}>✕</button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--hover-bg)', borderRadius: '12px' }}>
                            <Link size={32} color="var(--primary-color)" />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{file.name}</h4>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cualquier persona con el enlace puede ver esto</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Enlace para compartir
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={link}
                                readOnly
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-secondary)' }}
                            />
                            <button
                                onClick={handleCopy}
                                style={{
                                    background: copied ? 'var(--success-color)' : 'var(--primary-color)',
                                    color: 'white', border: 'none', borderRadius: '8px', padding: '0 1rem', cursor: 'pointer',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <Clock size={16} />
                            <span>Vence en 24 horas</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <Globe size={16} />
                            <span>Acceso público</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '1rem 2rem', background: 'var(--bg-color)', borderTop: '1px solid var(--border-color)', borderRadius: '0 0 16px 16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Listo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
