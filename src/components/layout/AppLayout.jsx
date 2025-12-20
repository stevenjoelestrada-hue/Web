import React from 'react';
import Header from './Header';

const AppLayout = ({ children, sidebar, user, onLogout, searchQuery, onSearch, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    return (
        <div className={`app-layout ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div className="mobile-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            <div className={`sidebar-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
                {sidebar}
            </div>

            <div className="main-content">
                <Header
                    user={user}
                    onLogout={onLogout}
                    searchQuery={searchQuery}
                    onSearch={onSearch}
                    onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                />
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
