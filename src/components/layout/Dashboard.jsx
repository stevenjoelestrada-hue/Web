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



    const { theme } = useTheme();

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

        // Colors based on theme
        const colors = theme === 'dark' ? {
            documents: '#60A5FA', // Azul brillante
            images: '#A78BFA',    // Morado brillante
            videos: '#F472B6',    // Rosa brillante
            music: '#34D399',     // Verde brillante
            others: '#FBBF24'     // Amarillo brillante
        } : {
            documents: '#ef4444', // Red
            images: '#8b5cf6',    // Purple
            videos: '#3b82f6',    // Blue
            music: '#ec4899',     // Pink
            others: '#64748b'     // Gray
        };

        return [
            { name: 'Documentos', value: counts.documents, color: colors.documents, key: 'documents' },
            { name: 'Imágenes', value: counts.images, color: colors.images, key: 'images' },
            { name: 'Videos', value: counts.videos, color: colors.videos, key: 'videos' },
            { name: 'Música', value: counts.music, color: colors.music, key: 'music' },
            { name: 'Otros', value: counts.others, color: colors.others, key: 'others' }
        ].filter(item => item.value > 0);
    }, [files, theme]);

    // ... (rest of code)

    return (
        // ...
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
                                stroke={theme === 'dark' ? '#1e293b' : '#fff'}
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--component-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: theme === 'dark' ? '#fff' : '#000'
                        }}
                        itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                    />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
                    {
        categoryData.length === 0 && (
            <div className="no-data-overlay" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sin archivos</p>
            </div>
        )
    }
                </div >

    {/* Card 3: Largest Files */ }
    < div className = "dashboard-card list-card" >
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
                </div >

    {/* Card 4: Recent Activity */ }
    < div className = "dashboard-card list-card" >
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
                </div >
            </div >
        </div >
    );
};

export default Dashboard;
