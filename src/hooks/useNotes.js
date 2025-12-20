import { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';

const STORAGE_KEY = 'filevault_notes';

export const useNotes = () => {
    const [notes, setNotes] = useState(() => {
        try {
            const savedNotes = localStorage.getItem(STORAGE_KEY);
            return savedNotes ? JSON.parse(savedNotes) : [];
        } catch (error) {
            console.error('Error loading notes:', error);
            return [];
        }
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [filterTag, setFilterTag] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    }, [notes]);

    const addNote = (noteData) => {
        const newNote = {
            id: Date.now().toString(),
            title: noteData.title || 'Sin título',
            content: noteData.content || '',
            tags: noteData.tags || [],
            isPinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false,
            color: noteData.color || '#ffffff'
        };
        setNotes(prev => [newNote, ...prev]);
        showNotification({ type: 'success', message: 'Nota creada correctamente' });
        return newNote.id;
    };

    const updateNote = (id, updates) => {
        setNotes(prev => prev.map(note =>
            note.id === id
                ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                : note
        ));
        // Only show if it matches a real update (not just background sync)
        if (updates.content !== undefined || updates.title !== undefined) {
            showNotification({ type: 'success', message: 'Nota guardada' });
        }
    };

    const deleteNote = (id) => {
        setNotes(prev => prev.map(note =>
            note.id === id ? { ...note, isDeleted: true } : note
        ));
        showNotification({ type: 'info', message: 'Nota movida a la papelera' });
    };

    const restoreNote = (id) => {
        setNotes(prev => prev.map(note =>
            note.id === id ? { ...note, isDeleted: false } : note
        ));
    };

    const permanentDeleteNote = (id) => {
        setNotes(prev => prev.filter(note => note.id !== id));
    };

    const togglePin = (id) => {
        setNotes(prev => prev.map(note => {
            if (note.id === id) {
                const newPinned = !note.isPinned;
                showNotification({ type: 'success', message: newPinned ? 'Nota anclada' : 'Nota desanclada' });
                return { ...note, isPinned: newPinned };
            }
            return note;
        }));
    };

    const getAllTags = useMemo(() => {
        const tags = new Set();
        notes.forEach(note => {
            if (!note.isDeleted && note.tags) {
                note.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }, [notes]);

    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => !note.isDeleted)
            .filter(note => {
                const matchesSearch = (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    note.content.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesTag = filterTag ? note.tags.includes(filterTag) : true;
                return matchesSearch && matchesTag;
            })
            .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
    }, [notes, searchQuery, filterTag]);

    const getStats = () => {
        const activeNotes = notes.filter(n => !n.isDeleted);
        const totalNotes = activeNotes.length;

        let totalWords = 0;
        let longestNote = { title: '', length: 0 };
        const notesByTag = {};

        activeNotes.forEach(note => {
            // Word count approximation
            const words = note.content.trim().split(/\s+/).length;
            if (note.content.trim() === '') totalWords += 0;
            else totalWords += words;

            // Longest note
            if (note.content.length > longestNote.length) {
                longestNote = { title: note.title, length: note.content.length };
            }

            // Tags
            note.tags.forEach(tag => {
                notesByTag[tag] = (notesByTag[tag] || 0) + 1;
            });
        });

        return {
            totalNotes,
            totalWords,
            longestNote,
            notesByTag: Object.entries(notesByTag).map(([name, value]) => ({ name, value }))
        };
    };

    return {
        notes,
        filteredNotes,
        addNote,
        updateNote,
        deleteNote,
        restoreNote,
        permanentDeleteNote,
        togglePin,
        searchQuery,
        setSearchQuery,
        filterTag,
        setFilterTag,
        allTags: getAllTags,
        getStats
    };
};
