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

            {/* Context Menu Trigger */}
            <div className="file-actions" onClick={e => e.stopPropagation()}>
                <button
                    className={`menu-trigger ${showMenu ? 'active' : ''}`}
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <MoreVertical size={18} />
                </button>

                {showMenu && (
                    <>
                        <div className="menu-overlay" onClick={() => setShowMenu(false)} />
                        <div className="context-menu theme-transition">
                            {isTrash ? (
                                <>
                                    <button onClick={() => { onRestore(file.id); setShowMenu(false); }} className="menu-item green">
                                        <RotateCcw size={16} />
                                        <span>Restaurar</span>
                                    </button>
                                    <button onClick={() => { onPermanentDelete(file.id); setShowMenu(false); }} className="menu-item red">
                                        <XCircle size={16} />
                                        <span>Eliminar Definitivamente</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <a
                                        href={fileSrc}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="menu-item blue"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        <Link size={16} />
                                        <span>Abrir</span>
                                    </a>
                                    <button onClick={() => { setIsRenaming(true); setShowMenu(false); }} className="menu-item yellow">
                                        <Edit2 size={16} />
                                        <span>Renombrar</span>
                                    </button>
                                    <div className="menu-divider"></div>
                                    <button onClick={() => { onDelete(file.id); setShowMenu(false); }} className="menu-item red">
                                        <Trash2 size={16} />
                                        <span>Eliminar</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .menu-trigger {
                    background: transparent;
                    border: none;
                    padding: 8px;
                    border-radius: 50%;
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex !important; /* Always visible */
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                    opacity: 1 !important; /* Always visible */
                }
                .menu-trigger:hover, .menu-trigger.active {
                    background: var(--hover-bg);
                    color: var(--text-main);
                }
                @media (max-width: 768px) {
                     .menu-trigger {
                        width: 44px; /* Touch target size */
                        height: 44px;
                        min-width: 44px;
                        min-height: 44px;
                        background: var(--hover-bg); /* Always show background on mobile for visibility */
                        color: var(--text-main);
                     }
                }
                .menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 100;
                    cursor: default;
                }
                .context-menu {
                    position: absolute;
                    top: 40px;
                    right: 0;
                    background: var(--component-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    padding: 6px;
                    min-width: 180px;
                    z-index: 101;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-main);
                    font-size: 13px;
                    font-weight: 500;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 8px;
                    text-decoration: none;
                    transition: background 0.2s;
                }
                .menu-item:hover {
                    background: var(--hover-bg);
                }
                .menu-item.blue:hover { color: var(--primary-color); background: #eff6ff; }
                .menu-item.green:hover { color: var(--success-color); background: #ecfdf5; }
                .menu-item.yellow:hover { color: var(--warning-color); background: #fffbeb; }
                .menu-item.red:hover { color: var(--error-color); background: #fef2f2; }
                
                .menu-divider {
                    height: 1px;
                    background: var(--border-color);
                    margin: 4px 0;
                }
            `}</style>
        </div>
    );
};

export default FileCard;
