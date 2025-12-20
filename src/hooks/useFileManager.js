import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNotification } from '../context/NotificationContext';

const MAX_STORAGE_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB limit
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB limit as requested

export const useFileManager = () => {
    const [files, setFiles] = useState(() => {
        try {
            const savedFiles = localStorage.getItem('file-manager-data');
            return savedFiles ? JSON.parse(savedFiles) : [];
        } catch (error) {
            console.error('Error loading files from localStorage:', error);
            return [];
        }
    });

    const [activeCategory, setActiveCategory] = useState('all');
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        try {
            const dataToSave = JSON.stringify(files);
            localStorage.setItem('file-manager-data', dataToSave);
        } catch (error) {
            console.error('Error saving files to localStorage:', error);
            setError('No se pudo guardar: Almacenamiento lleno.');
        }
    }, [files]);

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const calculateStorageUsage = () => {
        let usedBytes = 0;
        files.forEach(file => {
            if (!file.isDeleted && file.size) {
                const sizeStr = file.size;
                const num = parseFloat(sizeStr.split(' ')[0]);
                if (sizeStr.includes('MB')) usedBytes += num * 1024 * 1024;
                else if (sizeStr.includes('KB')) usedBytes += num * 1024;
                else if (sizeStr.includes('GB')) usedBytes += num * 1024 * 1024 * 1024;
                else usedBytes += num; // Bytes
            }
        });

        return {
            usedBytes,
            totalBytes: MAX_STORAGE_BYTES,
            percent: Math.min(100, (usedBytes / MAX_STORAGE_BYTES) * 100)
        };
    };

    const addFile = async (file) => {
        setError(null);
        if (file.size > MAX_FILE_BYTES) {
            showNotification({ type: 'warning', message: 'Archivo demasiado grande (máx 50MB)' });
            setError(`El archivo excede el límite de 50MB.`);
            return false;
        }

        const user = (await supabase.auth.getUser()).data.user;

        if (!user) {
            setError('Debes iniciar sesión para subir archivos.');
            return false;
        }

        try {
            // Upload to Supabase Storage
            // Policy required: (storage.foldername(name))[1] = auth.uid()::text
            const filePath = `${user.id}/${file.name}`;

            console.log(`Intentando subir a Supabase Bucket 'Files': ${filePath}`);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('Files')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Supabase Upload Error:', uploadError);
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage.from('Files').getPublicUrl(filePath);

            const newFile = {
                id: Date.now().toString(),
                name: file.name,
                type: file.type,
                size: (file.size / 1024 < 1024)
                    ? (file.size / 1024).toFixed(2) + ' KB'
                    : (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                date: new Date().toISOString().split('T')[0],
                // data: base64Data, // REMOVED to save space
                supabaseUrl: publicUrl,
                supabasePath: filePath,
                isDeleted: false,
                category: null
            };

            setFiles((prev) => [newFile, ...prev]);
            showNotification({ type: 'success', message: `Archivo "${file.name}" subido con éxito` });
            return true;
        } catch (err) {
            console.error("Error uploading file:", err);
            setError(`Error al subir archivo: ${err.message}`);
            showNotification({ type: 'error', message: `Fallo al subir "${file.name}"` });
            return false;
        }
    };

    const deleteFile = (id) => {
        setFiles((prev) => prev.map(f => f.id === id ? { ...f, isDeleted: true } : f));
        showNotification({ type: 'info', message: 'Archivo movido a la papelera' });
    };

    const restoreFile = (id) => {
        setFiles((prev) => prev.map(f => f.id === id ? { ...f, isDeleted: false } : f));
        showNotification({ type: 'success', message: 'Archivo restaurado correctamente' });
    };

    const permanentDeleteFile = (id) => {
        setFiles((prev) => prev.filter(f => f.id !== id));
        showNotification({ type: 'error', message: 'Archivo eliminado permanentemente' });
    };

    const renameFile = (id, newName) => {
        if (!newName || newName.trim() === "") return;
        setFiles((prev) => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    };

    const moveFile = (id, newCategory) => {
        setFiles((prev) => prev.map(f => f.id === id ? { ...f, category: newCategory } : f));
    };

    const getFileCategory = (file) => {
        if (file.isDeleted) return 'trash';
        if (file.category) return file.category;

        const type = file.type.toLowerCase();
        if (type.startsWith('image/')) return 'images';
        if (type.startsWith('video/')) return 'videos';
        if (type.startsWith('audio/')) return 'music';
        if (type.includes('pdf') || type.includes('document') || type.includes('text') || type.includes('word') || type.includes('msword')) return 'documents';
        return 'others';
    };

    const [folders, setFolders] = useState(() => {
        try {
            const savedFolders = localStorage.getItem('file-manager-folders');
            return savedFolders ? JSON.parse(savedFolders) : [];
        } catch (error) {
            console.error('Error loading folders:', error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('file-manager-folders', JSON.stringify(folders));
    }, [folders]);

    const createFolder = (name) => {
        if (!name || name.trim() === "") return false;
        if (folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
            setError('Ya existe una carpeta con ese nombre.');
            return false;
        }

        const newFolder = {
            id: Date.now().toString(),
            name: name.trim(),
            createdAt: new Date().toISOString()
        };

        setFolders(prev => [...prev, newFolder]);
        showNotification({ type: 'success', message: `Carpeta "${name}" creada` });
        return true;
    };

    const deleteFolder = (id) => {
        // Remove folder and reset folderId for files in it
        setFolders(prev => prev.filter(f => f.id !== id));
        setFiles(prev => prev.map(f => f.folderId === id ? { ...f, folderId: null } : f));
        if (activeCategory === `folder-${id}`) {
            setActiveCategory('all');
        }
    };

    const renameFolder = (id, newName) => {
        if (!newName || newName.trim() === "") return;
        if (folders.some(f => f.id !== id && f.name.toLowerCase() === newName.toLowerCase())) {
            setError('Ya existe una carpeta con ese nombre.');
            return;
        }
        setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    };

    const moveFileToFolder = (fileId, folderId) => {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, folderId: folderId } : f));
    };

    // calculate counts for folders too
    const counts = useMemo(() => {
        const newCounts = { all: 0, documents: 0, images: 0, videos: 0, music: 0, trash: 0 };
        const folderCounts = {};

        // Initialize folder counts
        folders.forEach(f => folderCounts[f.id] = 0);

        files.forEach(file => {
            if (file.isDeleted) {
                newCounts.trash++;
            } else {
                newCounts.all++;
                // Category counts
                const cat = getFileCategory(file);
                if (cat !== 'others' && cat !== 'trash') {
                    newCounts[cat] = (newCounts[cat] || 0) + 1;
                }
                // Folder counts
                if (file.folderId && folderCounts[file.folderId] !== undefined) {
                    folderCounts[file.folderId]++;
                }
            }
        });
        return { ...newCounts, ...folderCounts };
    }, [files, folders]);

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            if (activeCategory === 'trash') return file.isDeleted;
            if (file.isDeleted) return false;

            // Folder filtering
            if (activeCategory.startsWith('folder-')) {
                const folderId = activeCategory.replace('folder-', '');
                return file.folderId === folderId;
            }

            if (activeCategory === 'dashboard') return true; // Handled in App.js but good to keep consistency
            if (activeCategory === 'all') return true;

            return getFileCategory(file) === activeCategory;
        });
    }, [files, activeCategory, folders]);

    const storageUsage = calculateStorageUsage();

    return {
        files: filteredFiles,
        allFiles: files,
        folders,
        addFile,
        deleteFile,
        restoreFile,
        permanentDeleteFile,
        renameFile,
        moveFile,
        createFolder,
        deleteFolder,
        renameFolder,
        moveFileToFolder,
        activeCategory,
        setActiveCategory,
        counts,
        storageUsage,
        error,
        setError
    };
};

export async function listUserFiles(user) {
    if (!user) return { data: [], error: null };

    const { data, error } = await supabase.storage
        .from('Files')
        .list(user.id);

    return { data, error };
}
