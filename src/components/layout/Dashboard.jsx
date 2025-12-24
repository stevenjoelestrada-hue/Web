import React, { useMemo, useEffect, useRef } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FileText, Image, Video, Music, HardDrive, Clock, ChevronRight, Folder, StickyNote } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useNotes } from '../../hooks/useNotes';
import Uploader from '../Uploader';


const Dashboard = ({ files, folders, storageUsage, onNavigate, onPreview, onUpload }) => {
    const { getStats: getNoteStats } = useNotes();
    const { showNotification } = useNotification();
    const noteStats = getNoteStats();
    const hasWarnedRef = useRef(false);

    useEffect(() => {
        if (storageUsage.percent > 90 && !hasWarnedRef.current) {
            showNotification({
                type: 'warning',
                message: 'Espacio casi lleno (90% usado)',
                duration: 5000
            });
            hasWarnedRef.current = true;
        }
    }, [storageUsage.percent]);

    // Folder Stats
    const folderStats = useMemo(() => {
        if (!folders || folders.length === 0) return { count: 0, largest: null };

        const counts = {};
        folders.forEach(f => counts[f.id] = 0);
        files.forEach(f => {
            if (f.folderId && counts[f.folderId] !== undefined) counts[f.folderId]++;
        });

        let largest = null;
        let maxCount = -1;

        folders.forEach(f => {
            if (counts[f.id] > maxCount) {
                maxCount = counts[f.id];
                largest = { ...f, count: maxCount };
            }
        });

        return { count: folders.length, largest };
    }, [files, folders]);


    const categoryData = useMemo(() => {
        const counts = {
            documents: 0,
            images: 0,
            videos: 0,
            music: 0,
            others: 0
        };

        files.forEach(file => {
            if (file.isDeleted) return;

            const type = file.type.toLowerCase();
            if (file.category === 'documents' || type.includes('pdf') || type.includes('text') || type.includes('word')) counts.documents++;
            else if (file.category === 'images' || type.startsWith('image/')) counts.images++;
            else if (file.category === 'videos' || type.startsWith('video/')) counts.videos++;
            else if (file.category === 'music' || type.startsWith('audio/')) counts.music++;
            else counts.others++;
        });

        return [
            { name: 'Documentos', value: counts.documents, color: '#ef4444', key: 'documents' }, // Red
            { name: 'Imágenes', value: counts.images, color: '#8b5cf6', key: 'images' },   // Purple
            { name: 'Videos', value: counts.videos, color: '#3b82f6', key: 'videos' },     // Blue
            { name: 'Música', value: counts.music, color: '#ec4899', key: 'music' },       // Pink
            { name: 'Otros', value: counts.others, color: '#64748b', key: 'others' }       // Gray
        ].filter(item => item.value > 0);
    }, [files]);

    // Top 5 Largest Files
    const largestFiles = useMemo(() => {
        return [...files]
            .filter(f => !f.isDeleted)
            .sort((a, b) => {
                // Parse size string to bytes roughly for sorting
                const getBytes = (sizeStr) => {
                    const num = parseFloat(sizeStr.split(' ')[0]);
                    if (sizeStr.includes('MB')) return num * 1024 * 1024;
                    if (sizeStr.includes('KB')) return num * 1024;
                    return num;
                };
                return getBytes(b.size) - getBytes(a.size);
            })
            .slice(0, 5);
    }, [files]);

    // recent files
    const recentFiles = useMemo(() => {
        return [...files]
            .filter(f => !f.isDeleted)
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Assuming date is ISO string or timestamp
            // If date is simple string like YYYY-MM-DD, sorting might be stable enough if added sequentially
            // For better precision, we'd need a real timestamp property or assume ID is timestamp-based (which it is: Date.now())
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);
    }, [files]);

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="dashboard-wrapper">
            <div style={{ marginBottom: '2rem', background: 'var(--component-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <Uploader onUpload={onUpload} />
            </div>
            <div className="dashboard-grid">
                {/* Card 1: Storage Summary */}
                <div className="dashboard-card summary-card">
                    <div className="card-header">
                        <h3>Resumen de Almacenamiento</h3>
                        <HardDrive size={22} className="icon-colorful icon-blue" />
                    </div>
                    <div className="storage-stats">
                        <div className="stat-item">
                            <span className="stat-label">Archivos</span>
                            <span className="stat-value">{files.filter(f => !f.isDeleted).length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Carpetas</span>
                            <span className="stat-value">{folderStats.count}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Espacio Usado</span>
                            <span className="stat-value">{formatBytes(storageUsage.usedBytes)}</span>
                        </div>
                    </div>

                    {folderStats.largest && (
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Folder size={18} color="var(--primary-color)" />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mayor carpeta</div>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{folderStats.largest.name}</div>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{folderStats.largest.count}</div>
                        </div>
                    )}
                    <div className="storage-bar-large">
                        <div
                            className="storage-fill-large"
                            style={{
                                width: `${storageUsage.percent}%`,
                                backgroundColor: storageUsage.percent > 90 ? 'var(--error-color)' : 'var(--primary-color)'
                            }}
                        ></div>
                    </div>
                    <p className="storage-text">{storageUsage.percent.toFixed(1)}% utilizado</p>
                </div>

                {/* Card Notes Summary */}
                <div className="dashboard-card summary-card" onClick={() => onNavigate('notes')} style={{ cursor: 'pointer' }}>
                    <div className="card-header">
                        <h3>Notas</h3>
                        <StickyNote size={22} className="icon-colorful icon-yellow" />
                    </div>
                    <div className="storage-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total Notas</span>
                            <span className="stat-value">{noteStats.totalNotes}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Palabras</span>
                            <span className="stat-value">{noteStats.totalWords}</span>
                        </div>
                    </div>
                    {noteStats.longestNote.length > 0 && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nota más larga</div>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {noteStats.longestNote.title || 'Sin título'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Card 2: Distribution Chart */}
                <div className="dashboard-card chart-card">
                    <div className="card-header">
                        <h3>Distribución por Tipo</h3>
                    </div>
                    <div style={{ width: '100%', height: 200, minHeight: 200, display: 'block', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => onNavigate(entry.key)}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--component-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {categoryData.length === 0 && (
                        <div className="no-data-overlay" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sin archivos</p>
                        </div>
                    )}
                </div>

                {/* Card 3: Largest Files */}
                <div className="dashboard-card list-card">
                    <div className="card-header">
                        <h3>Archivos más Grandes</h3>
                    </div>
                    <div className="file-list-mini">
                        {largestFiles.map(file => (
                            <div key={file.id} className="mini-file-item" onClick={() => onPreview(file)}>
                                <div className="mini-file-info">
                                    <span className="mini-file-name">{file.name}</span>
                                    <span className="mini-file-size">{file.size}</span>
                                </div>
                                <ChevronRight size={16} color="var(--text-secondary)" />
                            </div>
                        ))}
                        {largestFiles.length === 0 && <p className="empty-text">No hay archivos</p>}
                    </div>
                </div>

                {/* Card 4: Recent Activity */}
                <div className="dashboard-card list-card">
                    <div className="card-header">
                        <h3>Actividad Reciente</h3>
                        <Clock size={22} className="icon-colorful icon-green" />
                    </div>
                    <div className="file-list-mini">
                        {recentFiles.map(file => (
                            <div key={file.id} className="mini-file-item" onClick={() => onPreview(file)}>
                                <div className="mini-file-info">
                                    <span className="mini-file-name">{file.name}</span>
                                    <span className="mini-file-date">{file.date}</span>
                                </div>
                            </div>
                        ))}
                        {recentFiles.length === 0 && <p className="empty-text">No hay actividad reciente</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
