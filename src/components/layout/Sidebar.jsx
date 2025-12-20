import {
    BarChart3, Grid3x3, FileText, Image as ImageIcon, Video, Music, Trash2,
    Settings, Folder, FolderPlus, MoreVertical, Edit2, Trash, Menu,
    Vault, User as UserIcon, StickyNote, CheckSquare, Calendar, Calculator
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';

const Sidebar = ({ activeCategory, onSelectCategory, counts, storageUsage, folders, onOpenCreateFolder, onDeleteFolder, onRenameFolder, user }) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [showOptionsId, setShowOptionsId] = useState(null);
    const { showNotification } = useNotification();

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', newState);
        window.dispatchEvent(new Event('resize'));
    };

    const mainMenuItems = [
        { id: 'dashboard', label: 'Estadísticas', shortLabel: 'Est', icon: BarChart3, colorClass: 'blue' },
        { id: 'all', label: 'Todos los Archivos', shortLabel: 'Arch', icon: Grid3x3, colorClass: 'purple' },
        { id: 'documents', label: 'Documentos', shortLabel: 'Docs', icon: FileText, colorClass: 'red' },
        { id: 'images', label: 'Imágenes', shortLabel: 'Img', icon: ImageIcon, colorClass: 'pink' },
        { id: 'videos', label: 'Videos', shortLabel: 'Vídeos', icon: Video, colorClass: 'blue' },
        { id: 'music', label: 'Música', shortLabel: 'Mús', icon: Music, colorClass: 'purple' },
        { id: 'trash', label: 'Papelera', shortLabel: 'Pap', icon: Trash2, colorClass: 'red' },
    ];

    const productivityItems = [
        { id: 'notes', label: 'Notas', shortLabel: 'Notas', icon: StickyNote, colorClass: 'yellow' },
        { id: 'tasks', label: 'Tareas', shortLabel: 'Tareas', icon: CheckSquare, colorClass: 'green' },
        { id: 'calendar', label: 'Calendario', shortLabel: 'Cal', icon: Calendar, colorClass: 'blue' },
        { id: 'calculator', label: 'Calculadora', shortLabel: 'Calc', icon: Calculator, colorClass: 'purple' },
    ];

    const handleRenameSubmit = (e, id) => {
        e.preventDefault();
        onRenameFolder(id, renameValue);
        setEditingFolderId(null);
        showNotification({ type: 'success', message: 'Carpeta renombrada' });
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="brand-container" onClick={() => onSelectCategory('dashboard')}>
                    <Vault size={28} className="brand-icon" />
                    {!isCollapsed && <span className="brand-text">FileVault</span>}
                </div>
                <button className="menu-toggle-btn" onClick={toggleCollapse}>
                    <Menu size={24} />
                </button>
            </div>

            <div className="nav-scroll-container">
                <nav className="nav-menu">
                    {mainMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className={`sidebar-item ${activeCategory === item.id ? 'active' : ''} icon-interactive ${item.colorClass || ''}`}
                                onClick={() => onSelectCategory(item.id)}
                                title={item.label}
                            >
                                <Icon size={24} className={`sidebar-icon icon-colorful ${item.colorClass || ''}`} />
                                <span className="sidebar-text">
                                    {isCollapsed ? item.shortLabel : item.label}
                                </span>
                                {!isCollapsed && counts && counts[item.id] > 0 && (
                                    <span className={`count-badge ${item.colorClass || ''}`}>{counts[item.id]}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-separator"></div>

                {!isCollapsed && (
                    <div className="section-header">
                        <span>MIS CARPETAS</span>
                        <button className="add-folder-btn" onClick={onOpenCreateFolder}>
                            <FolderPlus size={18} />
                        </button>
                    </div>
                )}

                <nav className="folder-list">
                    {folders && folders.map(folder => (
                        <div
                            key={folder.id}
                            className={`sidebar-item folder-item ${activeCategory === `folder-${folder.id}` ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                            onClick={() => onSelectCategory(`folder-${folder.id}`)}
                        >
                            <div className="item-main">
                                <Folder size={24} className="sidebar-icon" />
                                {editingFolderId === folder.id ? (
                                    <form onSubmit={(e) => handleRenameSubmit(e, folder.id)} style={{ width: '100%' }} onClick={e => e.stopPropagation()}>
                                        <input
                                            autoFocus
                                            className="folder-rename-input"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onBlur={() => setEditingFolderId(null)}
                                            onKeyDown={(e) => e.key === 'Escape' && setEditingFolderId(null)}
                                        />
                                    </form>
                                ) : (
                                    <span className="sidebar-text">
                                        {isCollapsed ? folder.name.substring(0, 4) : folder.name}
                                    </span>
                                )}
                            </div>

                            {!isCollapsed && (
                                <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="action-trigger"
                                        onClick={() => setShowOptionsId(showOptionsId === folder.id ? null : folder.id)}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {showOptionsId === folder.id && (
                                        <div className="options-dropdown">
                                            <div onClick={() => {
                                                setEditingFolderId(folder.id);
                                                setRenameValue(folder.name);
                                                setShowOptionsId(null);
                                            }}><Edit2 size={14} /> Renombrar</div>
                                            <div onClick={() => {
                                                if (confirm('¿Eliminar carpeta?')) {
                                                    onDeleteFolder(folder.id);
                                                    showNotification({ type: 'info', message: 'Carpeta eliminada' });
                                                }
                                                setShowOptionsId(null);
                                            }} className="delete"><Trash size={14} /> Eliminar</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-separator"></div>

                {!isCollapsed && (
                    <div className="section-header">
                        <span>PRODUCTIVIDAD</span>
                    </div>
                )}

                <nav className="nav-menu">
                    {productivityItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className={`sidebar-item ${activeCategory === item.id ? 'active' : ''} ${item.placeholder ? 'placeholder' : ''} icon-interactive ${item.colorClass || ''}`}
                                onClick={() => !item.placeholder && onSelectCategory(item.id)}
                                title={item.label}
                            >
                                <Icon size={24} className={`sidebar-icon icon-colorful ${item.colorClass || ''}`} />
                                <span className="sidebar-text">
                                    {isCollapsed ? item.shortLabel : item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-footer">
                <button
                    className={`sidebar-item ${activeCategory === 'settings' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('settings')}
                >
                    <Settings size={24} className="sidebar-icon" />
                    {!isCollapsed && <span className="sidebar-text">Configuración</span>}
                    {isCollapsed && <span className="sidebar-text">Config</span>}
                </button>

                {!isCollapsed && storageUsage && (
                    <div className="storage-widget">
                        <div className="storage-info">
                            <span>Almacenamiento</span>
                            <span>{storageUsage.percent.toFixed(0)}%</span>
                        </div>
                        <div className="storage-bar">
                            <div
                                className="storage-progress"
                                style={{ width: `${storageUsage.percent}%` }}
                            ></div>
                        </div>
                        <span className="storage-text">
                            {((storageUsage?.usedBytes || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB de {((storageUsage?.totalBytes || 0) / (1024 * 1024 * 1024)).toFixed(0)} GB
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
