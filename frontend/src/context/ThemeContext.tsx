import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type ThemeMode = 'light' | 'dark';

export type AccentColor =
  | 'blue'
  | 'emerald'
  | 'indigo'
  | 'rose'
  | 'amber'
  | 'purple'
  | 'cyan'
  | 'custom';

export type FontSizeOption = 'sm' | 'md' | 'lg';

export interface ACCENT_COLOR_OPTION {
  id: AccentColor;
  name: string;
  hex: string;
  darkHex: string;
  bgClass: string;
  borderClass: string;
  ringClass: string;
}

export const ACCENT_COLOR_PRESETS: ACCENT_COLOR_OPTION[] = [
  { id: 'blue', name: 'QC Royal Blue', hex: '#2563eb', darkHex: '#3b82f6', bgClass: 'bg-blue-600', borderClass: 'border-blue-600', ringClass: 'ring-blue-500' },
  { id: 'emerald', name: 'Emerald Tech', hex: '#10b981', darkHex: '#34d399', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-600', ringClass: 'ring-emerald-500' },
  { id: 'indigo', name: 'Indigo Elite', hex: '#6366f1', darkHex: '#818cf8', bgClass: 'bg-indigo-600', borderClass: 'border-indigo-600', ringClass: 'ring-indigo-500' },
  { id: 'rose', name: 'Rose Crimson', hex: '#f43f5e', darkHex: '#fb7185', bgClass: 'bg-rose-600', borderClass: 'border-rose-600', ringClass: 'ring-rose-500' },
  { id: 'amber', name: 'Warm Gold', hex: '#d97706', darkHex: '#fbbf24', bgClass: 'bg-amber-600', borderClass: 'border-amber-600', ringClass: 'ring-amber-500' },
  { id: 'purple', name: 'Amethyst Purple', hex: '#a855f7', darkHex: '#c084fc', bgClass: 'bg-purple-600', borderClass: 'border-purple-600', ringClass: 'ring-purple-500' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#06b6d4', darkHex: '#22d3ee', bgClass: 'bg-cyan-600', borderClass: 'border-cyan-600', ringClass: 'ring-cyan-500' },
];

export interface UIPreferences {
  theme: ThemeMode;
  accentColor: AccentColor;
  customHex: string;
  fontSize: FontSizeOption;
  animationsEnabled: boolean;
}

const DEFAULT_PREFERENCES: UIPreferences = {
  theme: 'light',
  accentColor: 'blue',
  customHex: '#2563eb',
  fontSize: 'md',
  animationsEnabled: true,
};

interface ThemeContextType {
  theme: ThemeMode;
  accentColor: AccentColor;
  customHex: string;
  fontSize: FontSizeOption;
  animationsEnabled: boolean;
  preferences: UIPreferences;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setAccentColor: (color: AccentColor, hex?: string) => void;
  setFontSize: (size: FontSizeOption) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  resetPreferences: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UIPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    const saved = localStorage.getItem('eduscholar_ui_preferences');
    if (saved) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved UI preferences', e);
      }
    }
    const legacyTheme = (localStorage.getItem('theme') as ThemeMode) || 'light';
    return { ...DEFAULT_PREFERENCES, theme: legacyTheme };
  });

  const { theme, accentColor, customHex, fontSize, animationsEnabled } = preferences;

  useEffect(() => {
    const root = document.documentElement;
    // Apply Light/Dark
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);

    // Apply Accent Color
    root.setAttribute('data-accent', accentColor);
    if (accentColor === 'custom' && customHex) {
      root.style.setProperty('--primary', customHex);
      root.style.setProperty('--ring', customHex);
    } else {
      const preset = ACCENT_COLOR_PRESETS.find(p => p.id === accentColor);
      if (preset) {
        root.style.setProperty('--primary', theme === 'dark' ? preset.darkHex : preset.hex);
        root.style.setProperty('--ring', theme === 'dark' ? preset.darkHex : preset.hex);
      } else {
        root.style.removeProperty('--primary');
        root.style.removeProperty('--ring');
      }
    }

    // Apply Font Size
    root.setAttribute('data-font-size', fontSize);

    // Save to LocalStorage
    localStorage.setItem('eduscholar_ui_preferences', JSON.stringify(preferences));
  }, [preferences, theme, accentColor, customHex, fontSize]);

  const setTheme = (mode: ThemeMode) => {
    setPreferences(prev => ({ ...prev, theme: mode }));
    toast.dismiss();
    toast.info(`Switched interface to ${mode.toUpperCase()} mode`);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const setAccentColor = (color: AccentColor, hex?: string) => {
    const newHex = hex || customHex;
    setPreferences(prev => ({ ...prev, accentColor: color, customHex: newHex }));
    toast.dismiss();
    toast.success(`Theme color updated to ${color.toUpperCase()}`);
  };

  const setFontSize = (size: FontSizeOption) => {
    setPreferences(prev => ({ ...prev, fontSize: size }));
    toast.dismiss();
    toast.info(`Text size scaling set to ${size.toUpperCase()}`);
  };

  const setAnimationsEnabled = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, animationsEnabled: enabled }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    toast.success('UI Customization reset to default QC Blue theme.');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentColor,
        customHex,
        fontSize,
        animationsEnabled,
        preferences,
        setTheme,
        toggleTheme,
        setAccentColor,
        setFontSize,
        setAnimationsEnabled,
        resetPreferences,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
