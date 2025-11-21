import { createContext, useContext, useState, useEffect } from 'react';

const DesignContext = createContext();

export const useDesign = () => {
    const context = useContext(DesignContext);
    if (!context) {
        throw new Error('useDesign must be used within a DesignProvider');
    }
    return context;
};

export const DesignProvider = ({ children }) => {
    const [theme, setTheme] = useState('vintage'); // vintage, modern, blueprint
    const [nodeStyle, setNodeStyle] = useState('card'); // card, leaf, stone
    const [lineStyle, setLineStyle] = useState('curved'); // curved, straight, orthogonal

    // Apply theme class to body
    useEffect(() => {
        document.body.className = `theme-${theme}`;
    }, [theme]);

    return (
        <DesignContext.Provider value={{
            theme, setTheme,
            nodeStyle, setNodeStyle,
            lineStyle, setLineStyle
        }}>
            {children}
        </DesignContext.Provider>
    );
};
