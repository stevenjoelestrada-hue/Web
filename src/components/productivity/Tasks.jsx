import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const Tasks = () => {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('filevault_tasks');
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');

    useEffect(() => {
        localStorage.setItem('filevault_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const newTask = {
            id: Date.now(),
            text: input.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        setTasks([newTask, ...tasks]);
        setInput('');
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="tasks-container">
            <div className="tasks-card">
                <div className="tasks-header">
                    <h2>Mis Tareas</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="tasks-count">{tasks.filter(t => !t.completed).length} pendientes</span>
                        <CheckCircle2 size={24} className="icon-colorful icon-green" />
                    </div>
                </div>

                <form onSubmit={addTask} className="task-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Añadir una nueva tarea..."
                    />
                    <button type="submit" className="icon-interactive blue"><Plus size={20} /></button>
                </form>

                <div className="tasks-list">
                    {tasks.map(task => (
                        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            <button className="toggle-btn icon-interactive green" onClick={() => toggleTask(task.id)}>
                                {task.completed ? <CheckCircle2 size={20} className="icon-colorful icon-green" /> : <Circle size={20} className="icon-colorful" />}
                            </button>
                            <span className="task-text">{task.text}</span>
                            <button className="delete-btn icon-interactive red" onClick={() => deleteTask(task.id)}>
                                <Trash2 size={18} className="icon-colorful icon-red" />
                            </button>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="empty-tasks">
                            <AlertCircle size={40} className="icon-colorful icon-blue" />
                            <p>No hay tareas pendientes</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .tasks-container {
                    display: flex;
                    justify-content: center;
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .tasks-card {
                    background: var(--component-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    width: 100%;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }
                .tasks-header {
                    padding: 24px;
                    background: var(--bg-color);
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .tasks-count {
                    font-size: 13px;
                    color: var(--primary-color);
                    font-weight: 600;
                    background: var(--hover-bg);
                    padding: 4px 12px;
                    border-radius: 20px;
                }
                .task-form {
                    padding: 20px;
                    display: flex;
                    gap: 12px;
                }
                .task-form input {
                    flex: 1;
                    background: var(--bg-color);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: var(--text-main);
                    outline: none;
                }
                .task-form button {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    width: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .tasks-list {
                    padding: 0 20px 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .task-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    background: var(--bg-color);
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .task-item:hover {
                    border-color: var(--border-color);
                    transform: translateX(4px);
                }
                .task-text {
                    flex: 1;
                    font-size: 15px;
                    color: var(--text-main);
                }
                .task-item.completed .task-text {
                    text-decoration: line-through;
                    color: var(--text-secondary);
                }
                .toggle-btn, .delete-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-secondary);
                    display: flex;
                    padding: 4px;
                }
                .delete-btn:hover {
                    color: var(--error-color);
                }
                .empty-tasks {
                    padding: 60px 0;
                    text-align: center;
                    color: var(--text-secondary);
                }
                .empty-tasks p {
                    margin-top: 12px;
                }
            `}</style>
        </div>
    );
};

export default Tasks;
