import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const WelcomeScreen = ({ onLogin }) => {
    return (
        <div className="welcome-overlay">
            <div className="welcome-card">
                <div className="logo-section">
                    <ShieldCheck size={64} className="welcome-logo" />
                </div>
                <h1>Bienvenido a FileVault</h1>
                <p className="subtitle">Tu gestor de archivos personal, seguro y eficiente.</p>

                <div className="welcome-form">
                    <button
                        onClick={onLogin}
                        className="start-btn"
                        style={{
                            width: '100%',
                            minHeight: '48px',
                            justifyContent: 'center',
                            background: '#fff',
                            color: '#3c4043',
                            border: '1px solid #dadce0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '0 24px',
                            fontSize: '15px',
                            fontWeight: '500'
                        }}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span>Sign in with Google</span>
                    </button>
                </div>

                <p className="disclaimer" style={{ marginTop: '2rem' }}>
                    Al continuar, accedes a tu almacenamiento seguro en la nube.
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;
