
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('taskflow-theme') || 'taskflow-light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('taskflow-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === 'taskflow-light'
                ? 'taskflow-dark'
                : 'taskflow-light'
        );
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark: theme === 'taskflow-dark',
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
