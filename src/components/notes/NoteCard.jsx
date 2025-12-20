const FONTS = {
    'sans': 'Inter, sans-serif',
    'serif': 'Merriweather, serif',
    'mono': 'Fira Code, monospace',
    'cursive': 'Dancing Script, cursive',
};

import { Pin, Trash2, Tag, Calendar, Edit2 } from 'lucide-react';
const NoteCard = ({ note, onEdit, onDelete, onPin }) => {
    // Helper to extract plain text from markdown/html if needed later
    // For now, assuming content is plain text or we just show raw snippet
    const getSnippet = (content) => {
        if (!content) return 'Sin contenido adicional...';
        return content.length > 150 ? content.substring(0, 150) + '...' : content;
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'Sin fecha';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Fecha inválida';

        return new Intl.DateTimeFormat('es-ES', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const cardStyle = {
        backgroundColor: note.backgroundColor || 'var(--component-bg)',
        color: note.textColor || 'var(--text-main)',
        fontFamily: FONTS[note.fontFamily] || 'inherit',
        border: note.backgroundColor && note.backgroundColor !== '#ffffff' ? 'none' : '1px solid var(--border-color)'
    };

    return (
        <div
            className={`note-card ${note.isPinned ? 'pinned' : ''}`}
            onClick={() => onEdit(note)}
            style={cardStyle}
        >
            <div className="note-card-header">
                <h3 className="note-title" style={{ color: note.textColor }}>{note.title || 'Sin Título'}</h3>
                <div className="note-actions">
                    <button
                        className={`icon-btn small icon-interactive blue ${note.isPinned ? 'active-pin' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onPin(note.id); }}
                        title={note.isPinned ? "Desanclar" : "Anclar"}
                        style={{ color: note.textColor ? note.textColor : undefined }}
                    >
                        <Pin size={16} className="icon-colorful" fill={note.isPinned ? "currentColor" : "none"} />
                    </button>
                    <button
                        className="icon-btn small delete-btn icon-interactive red"
                        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                        title="Eliminar"
                        style={{ color: note.textColor ? note.textColor : undefined }}
                    >
                        <Trash2 size={16} className="icon-colorful" />
                    </button>
                </div>
            </div>

            {/* Note content removed for privacy */}

            <div className="note-card-footer">
                <div className="note-tags-list">
                    {note.tags && note.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="note-tag-badge">
                            #{tag}
                        </span>
                    ))}
                    {note.tags && note.tags.length > 3 && (
                        <span className="note-tag-more" style={{ color: note.textColor }}>
                            +{note.tags.length - 3}
                        </span>
                    )}
                </div>
                <div className="note-date" style={{ color: note.textColor ? `${note.textColor}99` : undefined }}>
                    {formatDate(note.updatedAt)}
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
