import React, { useState, useEffect } from 'react';
import { History, Notebook, Trash2, Save } from 'lucide-react';

const Calculator = () => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('calculatorHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const [notes, setNotes] = useState(localStorage.getItem('calculatorNotes') || '');
    const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'history' | 'notes'

    useEffect(() => {
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        localStorage.setItem('calculatorNotes', notes);
    }, [notes]);

    const handleNumber = (num) => {
        setDisplay(prev => prev === '0' ? String(num) : prev + num);
        setEquation(prev => prev + num);
    };

    const handleOperator = (op) => {
        setEquation(prev => prev + ' ' + op + ' ');
        setDisplay('0');
    };

    const handleScientific = (func) => {
        try {
            let val = parseFloat(display);
            let result;
            switch (func) {
                case 'sin': result = Math.sin(val); break;
                case 'cos': result = Math.cos(val); break;
                case 'tan': result = Math.tan(val); break;
                case 'log': result = Math.log10(val); break;
                case 'sqrt': result = Math.sqrt(val); break;
                case 'pow': setEquation(prev => prev + ' ** '); setDisplay('0'); return;
                case 'pi': result = Math.PI; break;
                default: return;
            }
            const resStr = String(Number(result.toFixed(6)));
            setDisplay(resStr);
            setEquation(resStr);
        } catch (e) {
            setDisplay('Error');
        }
    };

    const calculate = () => {
        try {
            const result = eval(equation.replace('x', '*').replace('^', '**'));
            const resStr = String(Number(result.toFixed(8)));

            // Add to history
            const newHistoryItem = {
                id: Date.now(),
                eq: equation,
                res: resStr
            };
            setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));

            setDisplay(resStr);
            setEquation(resStr);
        } catch (e) {
            setDisplay('Error');
            setEquation('');
        }
    };

    const clear = () => {
        setDisplay('0');
        setEquation('');
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <div className="calc-page-wrapper theme-transition">
            {/* Display - Always visible on mobile */}
            <div className="calc-display-mobile">
                <div className="calc-equation">{equation || ' '}</div>
                <div className="calc-main-num">{display}</div>
            </div>

            {/* Mobile Tabs */}
            <div className="calc-mobile-tabs">
                <button
                    className={`calc-tab ${activeTab === 'calculator' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calculator')}
                >
                    Calculadora
                </button>
                <button
                    className={`calc-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Historial
                </button>
                <button
                    className={`calc-tab ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    Notas
                </button>
            </div>

            <div className="calc-layout">
                {/* Left: History */}
                <div className={`calc-sidebar history ${activeTab === 'history' ? 'mobile-active' : ''}`}>
                    <div className="sidebar-header">
                        <History size={18} className="icon-colorful icon-blue" />
                        <span>Historial</span>
                        <button onClick={clearHistory} className="clear-link-btn icon-interactive red" style={{ marginLeft: 'auto', background: 'none', border: 'none' }}>
                            <Trash2 size={14} className="icon-colorful icon-red" />
                        </button>
                    </div>
                    <div className="history-list">
                        {history.length === 0 ? (
                            <div className="empty-state">No hay historial</div>
                        ) : (
                            history.map(item => (
                                <div key={item.id} className="history-item" onClick={() => {
                                    setEquation(item.eq);
                                    setDisplay(item.res);
                                    setActiveTab('calculator'); // Switch to calculator on mobile
                                }}>
                                    <div className="hist-eq">{item.eq}</div>
                                    <div className="hist-res">= {item.res}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Center: Calculator */}
                <div className={`calc-center ${activeTab === 'calculator' ? 'mobile-active' : ''}`}>
                    <div className="calculator-glass compact">
                        <div className="calc-display">
                            <div className="calc-equation">{equation || ' '}</div>
                            <div className="calc-main-num">{display}</div>
                        </div>
                        <div className="calc-grid">
                            <button onClick={() => handleScientific('sin')} className="calc-btn sci">sin</button>
                            <button onClick={() => handleScientific('cos')} className="calc-btn sci">cos</button>
                            <button onClick={() => handleScientific('tan')} className="calc-btn sci">tan</button>
                            <button onClick={() => handleScientific('pi')} className="calc-btn sci">π</button>

                            <button onClick={() => handleScientific('sqrt')} className="calc-btn sci">√</button>
                            <button onClick={() => handleScientific('log')} className="calc-btn sci">log</button>
                            <button onClick={() => handleScientific('pow')} className="calc-btn sci">xʸ</button>
                            <button onClick={() => handleOperator('/')} className="calc-btn action">/</button>

                            <button onClick={() => handleNumber(7)} className="calc-btn">7</button>
                            <button onClick={() => handleNumber(8)} className="calc-btn">8</button>
                            <button onClick={() => handleNumber(9)} className="calc-btn">9</button>
                            <button onClick={() => handleOperator('*')} className="calc-btn action">×</button>

                            <button onClick={() => handleNumber(4)} className="calc-btn">4</button>
                            <button onClick={() => handleNumber(5)} className="calc-btn">5</button>
                            <button onClick={() => handleNumber(6)} className="calc-btn">6</button>
                            <button onClick={() => handleOperator('-')} className="calc-btn action">-</button>

                            <button onClick={() => handleNumber(1)} className="calc-btn">1</button>
                            <button onClick={() => handleNumber(2)} className="calc-btn">2</button>
                            <button onClick={() => handleNumber(3)} className="calc-btn">3</button>
                            <button onClick={() => handleOperator('+')} className="calc-btn action">+</button>

                            <button onClick={clear} className="calc-btn clear">C</button>
                            <button onClick={() => handleNumber(0)} className="calc-btn">0</button>
                            <button onClick={() => handleNumber('.')} className="calc-btn">.</button>
                            <button onClick={calculate} className="calc-btn equal">=</button>
                        </div>
                    </div>
                </div>

                {/* Right: Notes */}
                <div className={`calc-sidebar notes ${activeTab === 'notes' ? 'mobile-active' : ''}`}>
                    <div className="sidebar-header">
                        <Notebook size={18} className="icon-colorful icon-yellow" />
                        <span>Notas</span>
                    </div>
                    <textarea
                        className="calc-notes-area"
                        placeholder="Escribe tus notas aquí..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </div>

            <style>{`
                .calc-page-wrapper {
                    height: 100%;
                    width: 100%;
                    padding: 20px;
                    overflow: auto;
                }
                .calc-layout {
                    display: grid;
                    grid-template-columns: 260px 1fr 260px;
                    gap: 20px;
                    height: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .calc-sidebar {
                    background: var(--component-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    height: calc(100vh - 160px);
                }
                .sidebar-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .clear-link {
                    margin-left: auto;
                    font-size: 12px;
                    color: var(--primary-color);
                    background: none;
                    border: none;
                    cursor: pointer;
                }
                .history-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }
                .history-item {
                    padding: 10px;
                    border-radius: 10px;
                    cursor: pointer;
                    margin-bottom: 8px;
                    transition: background 0.2s;
                }
                .history-item:hover {
                    background: var(--hover-bg);
                }
                .hist-eq {
                    font-size: 11px;
                    color: var(--text-secondary);
                }
                .hist-res {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .calc-center {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .calculator-glass.compact {
                    background: var(--component-bg);
                    border: 1px solid var(--border-color);
                    padding: 16px;
                    border-radius: 24px;
                    box-shadow: var(--card-shadow);
                    max-width: 320px;
                    width: 100%;
                }
                .calc-display {
                    background: var(--bg-color);
                    padding: 16px;
                    border-radius: 16px;
                    text-align: right;
                    margin-bottom: 16px;
                    min-height: 80px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border: 1px solid var(--border-color);
                }
                .calc-equation {
                    font-size: 12px;
                    color: var(--text-secondary);
                    height: 18px;
                }
                .calc-main-num {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .calc-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }
                .calc-btn {
                    padding: 12px 6px;
                    border-radius: 12px;
                    border: none;
                    background: var(--bg-color);
                    color: var(--text-main);
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 48px;
                }
                .calc-btn:hover {
                    background: var(--hover-bg);
                    transform: translateY(-2px);
                }
                .calc-btn:active {
                    transform: scale(0.95);
                }
                .calc-btn.sci {
                    font-size: 12px;
                    color: var(--primary-color);
                    background: var(--hover-bg);
                }
                .calc-btn.action {
                    color: var(--primary-color);
                }
                .calc-btn.equal {
                    background: var(--primary-color);
                    color: white;
                }
                .calc-btn.clear {
                    color: var(--error-color);
                }
                .calc-notes-area {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 16px;
                    resize: none;
                    color: var(--text-main);
                    font-family: inherit;
                    font-size: 13px;
                    line-height: 1.5;
                    outline: none;
                }
                .empty-state {
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 12px;
                    margin-top: 20px;
                }

                /* MOBILE RESPONSIVE */
                @media (max-width: 768px) {
                    /* Mobile Display - Always visible */
                    .calc-display-mobile {
                        display: block;
                        background: var(--bg-color);
                        padding: 16px;
                        border-radius: 16px;
                        text-align: right;
                        margin-bottom: 12px;
                        min-height: 70px;
                        border: 1px solid var(--border-color);
                    }

                    /* Mobile Tabs */
                    .calc-mobile-tabs {
                        display: flex;
                        gap: 0;
                        border-bottom: 2px solid var(--border-color);
                        margin-bottom: 16px;
                        background: var(--component-bg);
                        border-radius: 12px 12px 0 0;
                        overflow: hidden;
                    }

                    .calc-tab {
                        flex: 1;
                        padding: 12px 8px;
                        border: none;
                        background: transparent;
                        color: var(--text-secondary);
                        font-size: 13px;
                        font-weight: 500;
                        cursor: pointer;
                        border-bottom: 3px solid transparent;
                        transition: all 0.2s ease;
                        position: relative;
                    }

                    .calc-tab.active {
                        color: var(--primary-color);
                        border-bottom-color: var(--primary-color);
                        background: var(--hover-bg);
                        font-weight: 600;
                    }

                    .calc-tab:active {
                        transform: scale(0.95);
                    }

                    .calc-page-wrapper {
                        padding: 1rem;
                        overflow-y: auto;
                        height: auto;
                    }

                    .calc-layout {
                        grid-template-columns: 1fr;
                        gap: 0;
                        height: auto;
                        position: relative;
                    }

                    /* Hide desktop display on mobile */
                    .calc-center .calc-display {
                        display: none;
                    }

                    /* Hide all sections by default on mobile */
                    .calc-sidebar,
                    .calc-center {
                        display: none;
                    }

                    /* Show only active section */
                    .calc-sidebar.mobile-active,
                    .calc-center.mobile-active {
                        display: block;
                    }

                    .calc-sidebar {
                        height: auto;
                        max-height: 60vh;
                        overflow-y: auto;
                        border-radius: 12px;
                    }

                    .calc-center {
                        grid-row: unset;
                    }

                    .calculator-glass.compact {
                        max-width: 100%;
                        padding: 12px;
                    }

                    .calc-equation {
                        font-size: 11px;
                    }

                    .calc-main-num {
                        font-size: 24px;
                    }

                    .calc-grid {
                        gap: 6px;
                    }

                    .calc-btn {
                        padding: 14px 8px;
                        font-size: 18px;
                        min-height: 52px;
                        border-radius: 10px;
                    }

                    .calc-btn.sci {
                        font-size: 13px;
                        padding: 10px 4px;
                    }
                }

                /* Hide mobile tabs on desktop */
                @media (min-width: 769px) {
                    .calc-mobile-tabs,
                    .calc-display-mobile {
                        display: none;
                    }
                }

                @media (max-width: 480px) {
                    .calc-page-wrapper {
                        padding: 0.5rem;
                    }

                    .calculator-glass.compact {
                        padding: 10px;
                        border-radius: 16px;
                    }

                    .calc-display {
                        padding: 10px;
                        min-height: 60px;
                    }

                    .calc-main-num {
                        font-size: 20px;
                    }

                    .calc-grid {
                        gap: 4px;
                    }

                    .calc-btn {
                        padding: 12px 6px;
                        font-size: 16px;
                        min-height: 48px;
                    }

                    .calc-btn.sci {
                        font-size: 11px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Calculator;
