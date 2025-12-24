import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, X, Info } from 'lucide-react';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('calendarEvents');
        return saved ? JSON.parse(saved) : {};
    });
    const [selectedDate, setSelectedDate] = useState(null); // String "YYYY-MM-DD"
    const [editingEvent, setEditingEvent] = useState({ message: '', color: '#3b82f6' });
    const [showMonthlyList, setShowMonthlyList] = useState(false);

    useEffect(() => {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }, [events]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    const prevMonthDays = daysInMonth(year, month - 1);
    const prevMonthVisibleDays = firstDay;

    const days = [];

    // Add prev month trailing days
    for (let i = prevMonthVisibleDays - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        const m = month === 0 ? 11 : month - 1;
        const y = month === 0 ? year - 1 : year;
        days.push({ day: d, month: m, year: y, current: false });
    }

    // Add current month days
    for (let i = 1; i <= totalDays; i++) {
        days.push({ day: i, month: month, year: year, current: true });
    }

    // Fill the rest with next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        const m = month === 11 ? 0 : month + 1;
        const y = month === 11 ? year + 1 : year;
        days.push({ day: i, month: m, year: y, current: false });
    }

    const formatDateKey = (d, m, y) => {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const isToday = (d, m, y) => {
        const today = new Date();
        return d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
    };

    const handleDayClick = (item) => {
        const key = formatDateKey(item.day, item.month, item.year);
        setSelectedDate(key);
        setEditingEvent(events[key] || { message: '', color: '#3b82f6' });
    };

    const handleSaveEvent = () => {
        if (!selectedDate) return;

        if (!editingEvent.message.trim()) {
            const newEvents = { ...events };
            delete newEvents[selectedDate];
            setEvents(newEvents);
        } else {
            setEvents({
                ...events,
                [selectedDate]: editingEvent
            });
        }
        setSelectedDate(null);
    };

    const monthlyEvents = Object.entries(events)
        .filter(([key]) => {
            const [y, m] = key.split('-').map(Number);
            return y === year && m === month + 1;
        })
        .sort(([a], [b]) => a.localeCompare(b));

    return (
        <div className="calendar-page-container">
            <div className={`calendar-layout ${showMonthlyList ? 'with-sidebar' : ''}`}>
                <div className="calendar-main">
                    <div className="calendar-card theme-transition">
                        {/* Desktop Header */}
                        <div className="calendar-header calendar-header-desktop">
                            <div className="month-year">
                                <CalendarIcon size={24} className="header-icon icon-colorful icon-blue" />
                                <h3>{monthNames[month]} {year}</h3>
                            </div>
                            <div className="calendar-controls">
                                <button className="summary-btn icon-interactive purple" onClick={() => setShowMonthlyList(!showMonthlyList)} title="Ver notas del mes">
                                    <Info size={18} className="icon-colorful icon-purple" />
                                    <span>Notas del Mes</span>
                                </button>
                                <div className="calendar-nav">
                                    <button onClick={prevMonth} className="icon-interactive blue"><ChevronLeft size={20} /></button>
                                    <button onClick={nextMonth} className="icon-interactive blue"><ChevronRight size={20} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Header - Vertical Navigation fixed to Horizontal */}
                        <div className="calendar-header calendar-header-mobile">
                            <button onClick={prevMonth} className="mobile-nav-btn icon-interactive blue" title="Mes anterior">
                                <ChevronLeft size={24} />
                            </button>
                            <div className="month-year-mobile">
                                <CalendarIcon size={20} className="header-icon icon-colorful icon-blue" />
                                <h3>{monthNames[month]} {year}</h3>
                            </div>
                            <button onClick={nextMonth} className="mobile-nav-btn icon-interactive blue" title="Mes siguiente">
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Notes Toggle Button - Mobile Only */}
                        <button
                            className="mobile-notes-toggle icon-interactive purple"
                            onClick={() => setShowMonthlyList(!showMonthlyList)}
                        >
                            <Info size={18} className="icon-colorful icon-purple" />
                            <span>{showMonthlyList ? 'Ocultar' : 'Ver'} Notas del Mes</span>
                        </button>

                        <div className="calendar-grid">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                                <div key={d} className="weekday">{d}</div>
                            ))}
                            {days.map((item, index) => {
                                const key = formatDateKey(item.day, item.month, item.year);
                                const event = events[key];
                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleDayClick(item)}
                                        className={`day-cell ${!item.current ? 'not-current' : ''} ${isToday(item.day, item.month, item.year) ? 'today' : ''} ${event ? 'has-event' : ''}`}
                                        title={event?.message || ''}
                                        style={event ? { borderColor: event.color } : {}}
                                    >
                                        <span className="day-num">{item.day}</span>
                                        {event && <div className="event-dot" style={{ backgroundColor: event.color }}></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mobile Notes Section - Moved inside main wrapper for flow */}
                    {showMonthlyList && (
                        <div className="mobile-notes-section theme-transition">
                            <div className="sidebar-header">
                                <h4>Notas de {monthNames[month]}</h4>
                            </div>
                            <div className="monthly-notes-list">
                                {monthlyEvents.length === 0 ? (
                                    <p className="empty-notes">No hay notas para este mes.</p>
                                ) : (
                                    monthlyEvents.map(([key, ev]) => (
                                        <div key={key} className="monthly-note-item" style={{ borderLeftColor: ev.color }}>
                                            <div className="note-date">{key.split('-')[2]} {monthNames[month].slice(0, 3)}</div>
                                            <div className="note-msg">{ev.message}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop Sidebar - kept for desktop */}
                {showMonthlyList && (
                    <div className="calendar-sidebar theme-transition desktop-only">
                        <div className="sidebar-header">
                            <h4>Notas de {monthNames[month]}</h4>
                            <button onClick={() => setShowMonthlyList(false)} className="close-sidebar"><X size={16} /></button>
                        </div>
                        <div className="monthly-notes-list">
                            {monthlyEvents.length === 0 ? (
                                <p className="empty-notes">No hay notas para este mes.</p>
                            ) : (
                                monthlyEvents.map(([key, ev]) => (
                                    <div key={key} className="monthly-note-item" style={{ borderLeftColor: ev.color }}>
                                        <div className="note-date">{key.split('-')[2]} {monthNames[month].slice(0, 3)}</div>
                                        <div className="note-msg">{ev.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedDate && (
                <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
                    <div className="modal-content event-modal theme-transition" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nota para {selectedDate}</h3>
                            <button onClick={() => setSelectedDate(null)} className="close-modal"><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Mensaje:</label>
                                <textarea
                                    value={editingEvent.message}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, message: e.target.value })}
                                    placeholder="Escribe algo para este día..."
                                />
                            </div>

                            <div className="form-group color-selection">
                                <label>Color indicador:</label>
                                <input
                                    type="color"
                                    value={editingEvent.color}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, color: e.target.value })}
                                    className="color-picker-input"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setSelectedDate(null)}>Cancelar</button>
                            <button className="save-btn" onClick={handleSaveEvent}>
                                <Save size={18} />
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .calendar-page-container {
                    padding: 20px;
                    height: 100%;
                    overflow-y: auto;
                }
                .calendar-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                    max-width: 900px;
                    margin: 0 auto;
                    transition: all 0.3s ease;
                }
                .calendar-layout.with-sidebar {
                    grid-template-columns: 1fr 300px;
                }
                .calendar-card {
                    background: var(--component-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    padding: 12px;
                    box-shadow: var(--card-shadow);
                    display: flex;
                    flex-direction: column;
                }
                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .month-year h3 {
                    margin: 0;
                    font-size: 22px;
                    color: var(--text-main);
                }
                .calendar-controls {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .summary-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--bg-color);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    color: var(--text-main);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .summary-btn:hover {
                    border-color: var(--primary-color);
                    background: var(--hover-bg);
                }
                .calendar-nav button {
                    background: var(--bg-color);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 6px;
                    color: var(--text-main);
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                /* FIX: Dark mode visibility */
                :global(.dark) .calendar-nav button {
                    color: white;
                    border-color: #475569;
                }
                .calendar-nav button:hover {
                    color: var(--primary-color);
                    border-color: var(--primary-color);
                }
                /* ... (rest of styles) */
                @media (max-width: 768px) {
                    /* FIX: Mobile width */
                    .calendar-layout {
                        max-width: 95vw;
                        margin: 0 auto;
                        gap: 12px;
                    }
                    /* ... */
                }
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }
                .weekday {
                    text-align: center;
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    padding-bottom: 4px;
                }
                .day-cell {
                    min-height: 45px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: var(--bg-color);
                    border: 1px solid transparent;
                    position: relative;
                }
                .day-cell:hover {
                    background: var(--hover-bg);
                    transform: scale(1.05);
                }
                .day-num {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .day-cell.not-current {
                    opacity: 0.3;
                }
                .day-cell.today {
                    background: var(--primary-color) !important;
                    border-color: var(--primary-color) !important;
                }
                .day-cell.today .day-num {
                    color: white;
                }
                .event-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    margin-top: 4px;
                }
                
                /* Sidebar */
                .calendar-sidebar {
                    background: var(--component-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    height: fit-content;
                    max-height: 600px;
                }
                .sidebar-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .sidebar-header h4 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--text-main);
                }
                .close-sidebar {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                }
                .monthly-notes-list {
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .monthly-note-item {
                    padding: 12px;
                    background: var(--bg-color);
                    border-radius: 12px;
                    border-left: 4px solid var(--primary-color);
                    transition: transform 0.2s;
                }
                .monthly-note-item:hover {
                    transform: translateX(4px);
                }
                .note-date {
                    font-size: 11px;
                    color: var(--text-secondary);
                    font-weight: 700;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                }
                .note-msg {
                    font-size: 13px;
                    color: var(--text-main);
                    line-height: 1.4;
                }
                .empty-notes {
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 14px;
                    padding: 40px 0;
                }
                
                .mobile-notes-section {
                    display: none;
                }

                /* Modal Specific */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: var(--component-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    max-width: 450px;
                    width: 90%;
                    padding: 24px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: var(--text-main);
                }
                .close-modal {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .form-group textarea {
                    width: 100%;
                    min-height: 120px;
                    background: var(--bg-color);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 12px;
                    color: var(--text-main);
                    font-family: inherit;
                    resize: none;
                    outline: none;
                }
                .form-group textarea:focus {
                    border-color: var(--primary-color);
                }
                .color-picker-input {
                    display: block;
                    width: 100%;
                    height: 40px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-color);
                    padding: 4px;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }
                .save-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .save-btn:hover {
                    background: var(--primary-hover);
                }
                .cancel-btn {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    padding: 10px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .cancel-btn:hover {
                    background: var(--hover-bg);
                }
                @media (max-width: 768px) {
                    .calendar-header-desktop { display: none; }
                    /* FIX: Horizontal alignment for buttons */
                    .calendar-header-mobile { 
                        display: flex; 
                        flex-direction: row; 
                        justify-content: space-between; 
                        align-items: center; 
                        gap: 12px; 
                        padding: 12px; 
                        background: var(--hover-bg); 
                        border-radius: 16px; 
                        margin-bottom: 12px; 
                    }
                    .month-year-mobile { display: flex; align-items: center; gap: 8px; justify-content: center; flex: 1; }
                    .month-year-mobile h3 { margin: 0; font-size: 16px; color: var(--text-main); font-weight: 700; }
                    .mobile-nav-btn { 
                        background: var(--component-bg); 
                        border: 1px solid var(--border-color); 
                        border-radius: 12px; 
                        padding: 0;
                        width: 44px;
                        height: 44px;
                        cursor: pointer; 
                        transition: all 0.2s; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        color: #000000 !important; /* Strong Black for Light Mode */
                        opacity: 1 !important;
                    }
                    /* Dark Mode High Contrast */
                    :global(.dark) .mobile-nav-btn {
                        color: #FFFFFF !important; /* Strong White for Dark Mode */
                        border-color: #64748b !important;
                    }
                    .mobile-nav-btn:active { transform: scale(0.95); }
                    .mobile-notes-toggle { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 12px; cursor: pointer; font-size: 14px; font-weight: 600; }
                    
                    /* FIX: Show notes below calendar */
                    .mobile-notes-section {
                        display: block;
                        background: var(--component-bg);
                        border: 1px solid var(--border-color);
                        border-radius: 16px;
                        margin-top: 16px;
                        max-height: 400px;
                        overflow-y: auto;
                    }

                    .calendar-page-container { padding: 12px; }
                    .calendar-card { padding: 8px; border-radius: 16px; }
                    .day-cell { min-height: 44px; min-width: 44px; padding: 6px; border-radius: 10px; font-size: 14px; }
                    .day-num { font-size: 13px; }
                    .weekday { font-size: 11px; padding: 8px 4px; }
                    .event-dot { width: 5px; height: 5px; }
                    .calendar-layout.with-sidebar { grid-template-columns: 1fr; }
                    
                    .desktop-only { display: none !important; }

                    .modal-content { width: 95%; max-width: 95%; padding: 20px; border-radius: 16px; }
                    .modal-header h3 { font-size: 16px; }
                    .form-group textarea { min-height: 100px; font-size: 16px; padding: 14px; }
                    .color-picker-input { height: 52px; border-radius: 12px; }
                    .modal-footer { flex-direction: column; gap: 10px; }
                    .save-btn, .cancel-btn { width: 100%; padding: 14px 24px; font-size: 16px; min-height: 48px; border-radius: 12px; }
                }
                @media (min-width: 769px) {
                    .calendar-header-mobile, .mobile-notes-toggle { display: none; }
                }
            `}</style>
        </div>
    );
};

export default Calendar;
