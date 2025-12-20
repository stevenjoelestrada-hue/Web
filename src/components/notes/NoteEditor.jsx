import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    X, Save, Clock, Tag, Plus, Type, Palette,
    Layout, Maximize2, Minimize2, Download, FileText,
    MoreHorizontal, AlignLeft, Bold, Italic, List, Settings
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const FONTS = {
    'sans': 'Inter, sans-serif',
    'serif': 'Merriweather, serif',
    'mono': 'Fira Code, monospace',
    'cursive': 'Dancing Script, cursive',
    'modern': 'Outfit, sans-serif',
    'elegant': 'Playfair Display, serif'
};

const COLORS = [
    '#ffffff', // Blanco
    '#f8fafc', // Pizarra
    '#fffbeb', // Ámbar
    '#e0f2fe', // Cielo
    '#dcfce7', // Esmeralda
    '#fce7f3', // Rosa
    '#f3f4f6', // Gris
    '#0f172a', // Oscuro
];

const TEXT_COLORS = [
    '#1e293b', // Slate 800
    '#475569', // Slate 600
    '#2563eb', // Blue 600
    '#16a34a', // Green 600
    '#dc2626', // Red 600
    '#9333ea', // Purple 600
];

const TEMPLATES = {
    'blanco': {
        title: '',
        content: ''
    },
    'lista': {
        title: 'Lista de Tareas Pendientes',
        content: '<h3>Mi Lista de Hoy</h3><ul><li>[ ] Tarea prioritaria 1</li><li>[ ] Tarea prioritaria 2</li><li>[ ] Tarea secundaria</li></ul><p><i>Nota: Usa el botón de lista para añadir más.</i></p>'
    },
    'reunión': {
        title: 'Minutas de Reunión',
        content: '<h2>Reunión: [Nombre del Proyecto]</h2><p><b>Fecha:</b> ' + new Date().toLocaleDateString() + '</p><p><b>Participantes:</b></p><ul><li> </li></ul><hr><h3>Orden del Día</h3><ol><li>Objetivo principal</li><li>Progreso actual</li><li>Bloqueos</li></ol><h3>Acuerdos y Tareas</h3><ul><li>[ ] Responsable: Tarea 1</li></ul>'
    },
    'idea': {
        title: 'Exploración de Idea 💡',
        content: '<h2 style="color: #2563eb;">Concepto: [Título de la Idea]</h2><p><b>¿Qué problema resuelve?</b></p><p>...</p><p><b>Impacto estimado:</b> Alto / Medio / Bajo</p><p><b>Primeros pasos para prototipar:</b></p><ul><li>Búsqueda inicial</li><li>Esquema básico</li></ul>'
    },
    'diario': {
        title: 'Mi Diario - ' + new Date().toLocaleDateString(),
        content: '<h3>Reflexión del Día</h3><p><b>¿Cómo me siento hoy?</b></p><p>...</p><p><b>Logro más importante:</b></p><p>...</p><p><b>Gratitud:</b> Hoy estoy agradecido por...</p>'
    },
    'proyecto': {
        title: 'Hoja de Ruta del Proyecto',
        content: '<h1>🚀 Plan de Lanzamiento</h1><p><b>Objetivo:</b> Finalizar la fase de desarrollo para [Fecha]</p><h3>Hitos Principales</h3><table><tr><th>Hito</th><th>Fecha Entrega</th><th>Estado</th></tr><tr><td>Diseño UI</td><td>---</td><td>Pendiente</td></tr><tr><td>Desarrollo Core</td><td>---</td><td>En progreso</td></tr></table>'
    },
    'finanzas': {
        title: 'Control de Presupuesto',
        content: '<h3>Resumen de Gastos</h3><p>Mes: <b>' + new Date().toLocaleString('default', { month: 'long' }) + '</b></p><ul><li><b>Presupuesto Total:</b> $0.00</li><li><b>Gastos Fijos:</b> $0.00</li><li><b>Gastos Variables:</b> $0.00</li></ul><p>---</p><p><i>Actualizar semanalmente.</i></p>'
    }
};

const NoteEditor = memo(({ note, onClose, onSave }) => {
    const { showNotification } = useNotification();
    // State
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [tags, setTags] = useState(note?.tags || []);
    const [style, setStyle] = useState({
        fontFamily: note?.fontFamily || 'sans',
        textColor: note?.textColor || '#1e293b',
        backgroundColor: note?.backgroundColor || '#ffffff'
    });

    // Configuration State
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
        return localStorage.getItem('note_autoSaveEnabled') === 'true';
    });
    const [autoSaveMinutes, setAutoSaveMinutes] = useState(() => {
        return Number(localStorage.getItem('note_autoSaveMinutes')) || 1;
    });
    const [customIntervals, setCustomIntervals] = useState(() => {
        const saved = localStorage.getItem('note_customIntervals');
        return saved ? JSON.parse(saved) : [];
    });
    const [customInputValue, setCustomInputValue] = useState('');

    const predefinedIntervals = [1, 3, 5, 8, 10];
    const allIntervals = [...new Set([...predefinedIntervals, ...customIntervals])].sort((a, b) => a - b);

    // Persistence
    useEffect(() => {
        localStorage.setItem('note_autoSaveEnabled', autoSaveEnabled);
        localStorage.setItem('note_autoSaveMinutes', autoSaveMinutes);
        localStorage.setItem('note_customIntervals', JSON.stringify(customIntervals));
    }, [autoSaveEnabled, autoSaveMinutes, customIntervals]);

    // UI State
    const [newTag, setNewTag] = useState('');
    const [lastSaved, setLastSaved] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isZenMode, setIsZenMode] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    // Refs
    const autoSaveTimerRef = useRef(null);
    const contentRef = useRef(null);
    const templatesMenuRef = useRef(null);
    const settingsMenuRef = useRef(null);

    // Click Outside Detection
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (templatesMenuRef.current && !templatesMenuRef.current.contains(event.target)) {
                setShowTemplates(false);
            }
            if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFormat = useCallback((type) => {
        const editor = contentRef.current;
        if (!editor) return;

        editor.focus();

        switch (type) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'list':
                document.execCommand('insertUnorderedList', false, null);
                break;
            default:
                return;
        }

        // Update state with new HTML content
        setContent(editor.innerHTML);
        setIsDirty(true);
    }, []);

    const handleContentChange = useCallback(() => {
        if (contentRef.current) {
            setContent(contentRef.current.innerHTML);
            setIsDirty(true);
        }
    }, []);

    // Unified internal save function
    const internalSave = useCallback(async (currentTags = tags) => {
        setIsSaving(true);
        // Ensure content is up to date from ref before saving
        const finalContent = contentRef.current ? contentRef.current.innerHTML : content;
        await onSave({
            ...note,
            title,
            content: finalContent,
            tags: currentTags,
            ...style,
            updatedAt: new Date().toISOString()
        });
        setLastSaved(new Date());
        setIsDirty(false);
        setIsSaving(false);
        setShowSaved(true);
    }, [note, title, content, tags, style, onSave]);

    // Initial load
    useEffect(() => {
        if (contentRef.current && content) {
            contentRef.current.innerHTML = content;
        }
    }, []); // Only on mount

    // Auto-save effect
    useEffect(() => {
        if (isDirty && !isSaving && autoSaveEnabled) {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = setTimeout(() => {
                internalSave();
            }, autoSaveMinutes * 60000);
        }
        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [isDirty, isSaving, internalSave, autoSaveEnabled, autoSaveMinutes]);

    // Clear "Guardado" message after 3 seconds
    useEffect(() => {
        if (showSaved) {
            const timer = setTimeout(() => {
                setShowSaved(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSaved]);

    // Manual Save Handler
    const handleManualSave = useCallback(() => {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        // If there's a tag in the input, add it before saving
        let finalTags = tags;
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            finalTags = [...tags, newTag.trim()];
            setTags(finalTags);
            setNewTag('');
        }

        internalSave(finalTags);
    }, [internalSave, tags, newTag]);

    const handleTextChange = useCallback((field, value) => {
        setIsDirty(true);
        if (field === 'title') setTitle(value);
        if (field === 'content') setContent(value);
    }, []);

    const handleStyleChange = useCallback((property, value) => {
        setStyle(prev => ({ ...prev, [property]: value }));
        setIsDirty(true);
    }, []);

    const handleAddTag = (e) => {
        e.preventDefault();
        const tag = newTag.trim();
        if (tag && !tags.includes(tag)) {
            setTags(prev => [...prev, tag]);
            setNewTag('');
            setIsDirty(true);
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(prev => prev.filter(t => t !== tagToRemove));
        setIsDirty(true);
    };

    const handleAddCustomInterval = (e) => {
        e.preventDefault();
        const val = parseFloat(customInputValue);
        if (!isNaN(val) && val >= 0.5 && val <= 60) {
            if (!allIntervals.includes(val)) {
                setCustomIntervals(prev => [...prev, val]);
            }
            setAutoSaveMinutes(val);
            setCustomInputValue('');
            showNotification({ type: 'success', message: `Auto-guardado configurado cada ${val} min` });
        } else {
            alert('Por favor ingresa un valor entre 0.5 y 60 minutos.');
        }
    };

    const removeCustomInterval = (val, e) => {
        e.stopPropagation();
        setCustomIntervals(prev => prev.filter(i => i !== val));
        if (autoSaveMinutes === val) {
            setAutoSaveMinutes(1);
        }
    };

    const applyTemplate = (templateKey) => {
        if (content && content !== '<br>' && !confirm('¿Reemplazar contenido actual con el template?')) return;
        const tmpl = TEMPLATES[templateKey];
        setTitle(tmpl.title);
        setContent(tmpl.content);
        if (contentRef.current) {
            contentRef.current.innerHTML = tmpl.content;
        }
        setShowTemplates(false);
        setIsDirty(true);
    };

    const exportNote = (format) => {
        let text = '';
        if (format === 'txt') {
            text = `Title: ${title}\nDate: ${new Date().toLocaleDateString()}\n\n${content}`;
        } else if (format === 'md') {
            text = `# ${title}\n\n${content}`;
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'nota'}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification({ type: 'success', message: `Nota exportada como ${format.toUpperCase()}` });
    };

    return (
        <div
            className={`note-editor-overlay ${isZenMode ? 'zen-mode' : ''}`}
            onClick={onClose}
        >
            <div
                className="note-editor-modal"
                style={{ backgroundColor: style.backgroundColor }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="note-editor-header">
                    <div className="editor-status">
                        {isSaving ? (
                            <span className="save-status" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={14} className="spin-slow" /> Guardando...
                            </span>
                        ) : isDirty ? (
                            <span className="save-status" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ✍️ Editando...
                            </span>
                        ) : showSaved ? (
                            <span className="save-status" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ✅ Guardado
                            </span>
                        ) : null}
                    </div>

                    <div className="editor-toolbar">
                        {/* Templates */}
                        <div className="toolbar-group" ref={templatesMenuRef}>
                            <button
                                className="icon-btn"
                                title="Plantillas de notas"
                                onClick={() => setShowTemplates(!showTemplates)}
                            >
                                <Layout size={18} />
                            </button>
                            {showTemplates && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-header">Plantillas</div>
                                    {Object.keys(TEMPLATES).map(key => (
                                        <div key={key} onClick={() => applyTemplate(key)} className="dropdown-item">
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Settings */}
                        <div className="toolbar-group" ref={settingsMenuRef}>
                            <button
                                className={`icon-btn ${autoSaveEnabled ? 'active-setting' : ''}`}
                                title="Ajustes de guardado"
                                onClick={() => setShowSettings(!showSettings)}
                            >
                                <Settings size={18} />
                                {autoSaveEnabled && <span className="indicator-dot"></span>}
                            </button>
                            {showSettings && (
                                <div className="dropdown-menu settings-dropdown">
                                    <div className="settings-item">
                                        <label className="switch-label">
                                            <span>⏱️ Auto-guardado</span>
                                            <input
                                                type="checkbox"
                                                checked={autoSaveEnabled}
                                                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                            />
                                        </label>
                                    </div>

                                    {autoSaveEnabled && (
                                        <>
                                            <div className="settings-section">
                                                <span className="settings-label">Seleccionar intervalo</span>
                                                <div className="interval-list">
                                                    {allIntervals.map(interval => (
                                                        <div
                                                            key={interval}
                                                            className={`interval-option ${autoSaveMinutes === interval ? 'active' : ''}`}
                                                            onClick={() => setAutoSaveMinutes(interval)}
                                                        >
                                                            {interval} {interval === 1 ? 'minuto' : 'minutos'}
                                                            {customIntervals.includes(interval) && (
                                                                <button
                                                                    className="remove-custom-btn"
                                                                    onClick={(e) => removeCustomInterval(interval, e)}
                                                                >
                                                                    &times;
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="settings-section">
                                                <span className="settings-label">Tiempo personalizado (0.5 - 60)</span>
                                                <div className="custom-interval-form">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="Ej: 15 o 2.5"
                                                        value={customInputValue}
                                                        onChange={(e) => setCustomInputValue(e.target.value)}
                                                        className="settings-number-input"
                                                    />
                                                    <button
                                                        className="btn-add-custom"
                                                        onClick={handleAddCustomInterval}
                                                        title="Guardar este tiempo"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="current-config-info">
                                                Actual: Auto-guarda cada <strong>{autoSaveMinutes}</strong> min
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Formatting */}
                        <div className="toolbar-group">
                            <button
                                className="icon-btn"
                                title="Negrita (Ctrl+B)"
                                onClick={() => handleFormat('bold')}
                            >
                                <Bold size={18} />
                            </button>
                            <button
                                className="icon-btn"
                                title="Cursiva (Ctrl+I)"
                                onClick={() => handleFormat('italic')}
                            >
                                <Italic size={18} />
                            </button>
                            <button
                                className="icon-btn"
                                title="Lista de viñetas"
                                onClick={() => handleFormat('list')}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {/* Styles */}
                        <div className="toolbar-group">
                            <select
                                className="toolbar-select"
                                value={style.fontFamily}
                                onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                                title="Tipo de fuente"
                            >
                                <option value="sans">Inter (Normal)</option>
                                <option value="serif">Merriweather (Libro)</option>
                                <option value="mono">Fira Code (Código)</option>
                                <option value="cursive">Escritura Manual</option>
                                <option value="modern">Moderna</option>
                                <option value="elegant">Elegante</option>
                            </select>

                            <input
                                type="color"
                                value={style.textColor}
                                onChange={(e) => handleStyleChange('textColor', e.target.value)}
                                title="Color de texto"
                                className="color-picker-input"
                            />

                            <input
                                type="color"
                                value={style.backgroundColor}
                                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                title="Color de fondo"
                                className="color-picker-input"
                            />
                        </div>

                        {/* Export & View */}
                        <div className="toolbar-group">
                            <button className="icon-btn" title="Descargar como TXT" onClick={() => exportNote('txt')}>
                                <FileText size={18} />
                            </button>
                            <button className="icon-btn" title={isZenMode ? "Salir de Modo Zen" : "Modo Zen"} onClick={() => setIsZenMode(!isZenMode)}>
                                {isZenMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="editor-actions">
                        <button className="icon-btn" onClick={onClose} title="Cerrar">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="note-editor-body" style={{ fontFamily: FONTS[style.fontFamily], color: style.textColor }}>
                    <input
                        type="text"
                        className="note-title-input"
                        placeholder="Título de la nota"
                        value={title}
                        onChange={(e) => handleTextChange('title', e.target.value)}
                        style={{ color: style.textColor }}
                    />

                    <div className="tags-input-area">
                        {tags.map(tag => (
                            <span key={tag} className="tag-pill">
                                #{tag}
                                <button onClick={() => removeTag(tag)}>&times;</button>
                            </span>
                        ))}
                        <form onSubmit={handleAddTag} style={{ display: 'inline-block' }}>
                            <div className="add-tag-wrapper">
                                <Tag size={14} className="tag-icon" />
                                <input
                                    type="text"
                                    placeholder="Añadir etiqueta..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    className="tag-input"
                                    style={{ color: style.textColor }}
                                />
                            </div>
                        </form>
                    </div>

                    <div
                        ref={contentRef}
                        className="note-content-editable"
                        contentEditable
                        onInput={handleContentChange}
                        onBlur={handleContentChange}
                        style={{
                            fontFamily: FONTS[style.fontFamily],
                            color: style.textColor,
                            minHeight: '300px',
                            outline: 'none',
                            padding: '1rem',
                            overflowY: 'auto',
                            backgroundColor: 'white'
                        }}
                    />
                </div>

                {/* Footer */}
                <div className="note-editor-footer">
                    <span className="word-count">
                        {content.trim() ? content.trim().split(/\s+/).length : 0} palabras
                    </span>
                    <button
                        className="btn-primary small"
                        onClick={handleManualSave}
                        disabled={!isDirty || isSaving}
                        style={{ marginLeft: 'auto' }}
                    >
                        <Save size={14} style={{ marginRight: '4px' }} /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
});

export default NoteEditor;
