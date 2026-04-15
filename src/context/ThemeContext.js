/**
 * ThemeContext – globální stav světlého/tmavého režimu.
 * Preferenci ukládá do AsyncStorage, při startu respektuje systémové nastavení.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'knihovna_emi_theme';

// Palety barev
export const COLORS = {
  light: {
    bg: '#f2f4f7',
    card: '#ffffff',
    cardBorder: '#e8e8e8',
    text: '#222222',
    textSub: '#555555',
    textMuted: '#888888',
    input: '#ffffff',
    inputBorder: '#dddddd',
    inputLocked: '#f0f0f0',
    inputLockedText: '#888888',
    chip: '#e0e0e0',
    chipText: '#555555',
    chipSort: '#e0e0e0',
    header: '#3498db',
    tabBar: '#ffffff',
    tabBarBorder: '#e0e0e0',
    tabBarActive: '#3498db',
    tabBarInactive: '#999999',
    fab: '#3498db',
    cancelBtn: '#e0e0e0',
    cancelText: '#444444',
    pickerBg: '#ffffff',
    modalBg: '#ffffff',
    modalOverlay: 'rgba(0,0,0,0.5)',
    helpBox: '#f8f9fa',
    helpBorder: '#e9ecef',
    infoCard: '#eaf4fb',
    infoCardBorder: '#d0e8f5',
    countText: '#666666',
    sortLabel: '#666666',
    shadow: '#000000',
  },
  dark: {
    bg: '#121212',
    card: '#1e1e1e',
    cardBorder: '#2a2a2a',
    text: '#f0f0f0',
    textSub: '#bbbbbb',
    textMuted: '#888888',
    input: '#2a2a2a',
    inputBorder: '#3a3a3a',
    inputLocked: '#1a1a1a',
    inputLockedText: '#666666',
    chip: '#2a2a2a',
    chipText: '#bbbbbb',
    chipSort: '#2a2a2a',
    header: '#1a2a3a',
    tabBar: '#1e1e1e',
    tabBarBorder: '#2a2a2a',
    tabBarActive: '#3498db',
    tabBarInactive: '#666666',
    fab: '#3498db',
    cancelBtn: '#2a2a2a',
    cancelText: '#cccccc',
    pickerBg: '#2a2a2a',
    modalBg: '#1e1e1e',
    modalOverlay: 'rgba(0,0,0,0.75)',
    helpBox: '#1a1a1a',
    helpBorder: '#2a2a2a',
    infoCard: '#1a2a3a',
    infoCardBorder: '#1e3a5a',
    countText: '#888888',
    sortLabel: '#888888',
    shadow: '#000000',
  },
};

const ThemeContext = createContext({
  dark: false,
  colors: COLORS.light,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'dark' nebo 'light'
  const [dark, setDark] = useState(systemScheme === 'dark');
  const [loaded, setLoaded] = useState(false);

  // Načíst uloženou preferenci
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'dark') setDark(true);
      else if (val === 'light') setDark(false);
      else setDark(systemScheme === 'dark'); // fallback na systém
      setLoaded(true);
    });
  }, []);

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ dark, colors: dark ? COLORS.dark : COLORS.light, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
