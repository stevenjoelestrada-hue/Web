import React, { useState, useEffect } from 'react';
import { storage } from '../supabase';

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            // 1. **CORRECCIÓN AQUÍ:** Usar storage.list() en lugar de storage.listAll()
            const { data, error } = await storage.list();

            if (error) {
                throw error;
            }

            // 2. Almacenar solo la lista de items (archivos)
            // Note: storage.list() returns the array directly in 'data', unlike some other responses.
            // Providing fallback to empty array.
            setFiles(data || []);
            setError(null);

        } catch (err) {
            console.error('Error fetching files:', err);
            setError('Error al cargar la lista de archivos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Cargando archivos...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (files.length === 0) return <p>No hay archivos subidos todavía.</p>;

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>Archivos Subidos ({files.length})</h3>
            <ul>
                {files.map((file) => (
                    <li key={file.id || file.name}>{file.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default FileList;
