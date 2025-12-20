import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('themeMode');
        return savedTheme || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('themeMode', theme);

        // Add transition class to body for smooth switching after initialization
        // We delay it slightly to prevent initial load transition
        const timeout = setTimeout(() => {
            document.body.classList.add('theme-transition');
        }, 100);

        return () => clearTimeout(timeout);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return { theme, toggleTheme };
};
