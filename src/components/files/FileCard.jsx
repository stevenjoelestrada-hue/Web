import React, { useState } from 'react';
import { FileText, Image, File, MoreVertical, FileCode, RotateCcw, Trash2, XCircle, Edit2, Check, X, FolderInput, Link } from 'lucide-react';

const getFileIcon = (type) => {
    const size = 32; // Standardized size for cards
    if (!type) return <File size={size} className="icon-colorful icon-blue" />;
    if (type.includes('image')) return <Image size={size} className="icon-colorful icon-green" />;
    if (type.includes('pdf')) return <FileText size={size} className="icon-colorful icon-red" />;
    if (type.includes('code') || type.includes('javascript') || type.includes('html') || type.includes('css'))
        return <FileCode size={size} className="icon-colorful icon-blue" />;
    if (type.includes('audio') || type.includes('music')) return <File size={size} className="icon-colorful icon-pink" />;
    if (type.includes('video')) return <File size={size} className="icon-colorful icon-yellow" />;
    return <File size={size} className="icon-colorful icon-blue" />;
};

const FileCard = ({ file, folders, onDelete, onRestore, onPermanentDelete, onRename, onMove, onMoveToFolder, onShare, onPreview }) => {
    const isTrash = file.isDeleted;
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(file.name);
    const [showMenu, setShowMenu] = useState(false);

    const handleRename = () => {
        if (newName.trim()) {
            onRename(file.id, newName);
            setIsRenaming(false);
        }
    };

    const handleCancelRename = () => {
        setNewName(file.name);
        setIsRenaming(false);
    };

    const fileSrc = file.supabaseUrl || file.data;

    return (
        <div className="file-card" onClick={() => !isTrash && !isRenaming && onPreview(file)}>
            <div className="file-preview">
                {fileSrc && file.type.startsWith('image/') ? (
                    <img src={fileSrc} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                    getFileIcon(file.type)
                )}
            </div>

            <div className="file-info">
                {isRenaming ? (
                    <div className="rename-input-wrapper" onClick={e => e.stopPropagation()}>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="rename-input"
                            autoFocus
                        />
                        <div className="rename-actions">
                            <button onClick={handleRename} className="action-btn icon-interactive green" title="Guardar"><Check size={14} /></button>
                            <button onClick={handleCancelRename} className="action-btn icon-interactive red" title="Cancelar"><X size={14} /></button>
                        </div>
                    </div>
                ) : (
                    <h4 className="file-name" title={file.name}>{file.name}</h4>
                )}
                <p className="file-meta">{file.size} • {file.date}</p>
            </div>

            <div className="file-actions" onClick={e => e.stopPropagation()}>
                {isTrash ? (
                    <>
                        <button className="action-btn icon-interactive green restore-btn" title="Restaurar" onClick={() => onRestore(file.id)}>
                            <RotateCcw size={18} />
                        </button>
                        <button className="action-btn icon-interactive red delete-btn" title="Eliminar Permanentemente" onClick={() => onPermanentDelete(file.id)}>
                            <XCircle size={18} />
                        </button>
                    </>
                ) : (
                    !isRenaming && (
                        <div className="active-actions" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <a
                                href={fileSrc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="action-btn icon-interactive blue"
                                title="Abrir en nueva pestaña"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Link size={18} />
                            </a>

                            <button className="action-btn icon-interactive yellow" title="Renombrar" onClick={() => setIsRenaming(true)}>
                                <Edit2 size={18} />
                            </button>

                            <button className="action-btn icon-interactive red" title="Eliminar" onClick={() => onDelete(file.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )
                )}
            </div>
        </div >
    );
};

export default FileCard;
