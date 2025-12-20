import React, { useState } from 'react';
import { Plus, LayoutGrid, List, Search, Tag, Filter } from 'lucide-react';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import { useNotes } from '../../hooks/useNotes';

const NotesDashboard = () => {
    const {
        notes,
        filteredNotes,
        addNote,
        updateNote,
        deleteNote,
        togglePin,
        searchQuery,
        setSearchQuery,
        filterTag,
        setFilterTag,
        allTags
    } = useNotes();

    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState(null);

    const handleCreateNote = () => {
        setCurrentNote(null);
        setIsEditorOpen(true);
    };

    const handleEditNote = (note) => {
        setCurrentNote(note);
        setIsEditorOpen(true);
    };

    const handleSaveNote = async (noteData) => {
        try {
            if (currentNote) {
                await updateNote(currentNote.id, noteData);
                window.dispatchEvent(new CustomEvent('fv-notification', {
                    detail: { message: 'Nota actualizada correctamente', type: 'success' }
                }));
            } else {
                await addNote(noteData);
                window.dispatchEvent(new CustomEvent('fv-notification', {
                    detail: { message: 'Nueva nota creada con éxito', type: 'success' }
                }));
            }
            setIsEditorOpen(false);
        } catch (error) {
            console.error("Error saving note:", error);
            window.dispatchEvent(new CustomEvent('fv-notification', {
                detail: { message: 'Error al guardar la nota', type: 'error' }
            }));
        }
    };

    return (
        <div className="notes-dashboard">
            {/* Toolbar */}
            <div className="notes-toolbar">
                <div className="search-bar-wrapper">
                    <Search size={18} className="search-icon icon-colorful icon-purple" />
                    <input
                        type="text"
                        placeholder="Buscar notas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="notes-search-input"
                    />
                </div>

                <div className="toolbar-actions">
                    <div className="filter-dropdown-wrapper">
                        <select
                            className="tag-filter-select"
                            value={filterTag || ''}
                            onChange={(e) => setFilterTag(e.target.value || null)}
                        >
                            <option value="">Todas las etiquetas</option>
                            {allTags.map(tag => (
                                <option key={tag} value={tag}>#{tag}</option>
                            ))}
                        </select>
                    </div>

                    <div className="view-toggle">
                        <button
                            className={`icon-btn icon-interactive blue ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Vista Cuadrícula"
                        >
                            <LayoutGrid size={18} className="icon-colorful" />
                        </button>
                        <button
                            className={`icon-btn icon-interactive blue ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Vista Lista"
                        >
                            <List size={18} className="icon-colorful" />
                        </button>
                    </div>

                    <button className="btn-primary" onClick={handleCreateNote}>
                        <Plus size={18} /> Nueva Nota
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={`notes-container ${viewMode}`}>
                {filteredNotes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>No hay notas</h3>
                        <p>{searchQuery ? 'Intenta con otra búsqueda' : 'Crea tu primera nota para empezar'}</p>
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onEdit={handleEditNote}
                            onDelete={deleteNote}
                            onPin={togglePin}
                        />
                    ))
                )}
            </div>

            {/* Editor Modal */}
            {isEditorOpen && (
                <NoteEditor
                    note={currentNote}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSaveNote}
                />
            )}
        </div>
    );
};

export default NotesDashboard;
