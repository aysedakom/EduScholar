import React from 'react';
import { Globe, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'pill' | 'expanded';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  variant = 'compact'
}) => {
  const { language, toggleLanguage, isTagalog, t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleLanguage}
        title={t('lang.switchPrompt')}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer shadow-xs border',
          isDark
            ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300',
          className
        )}
      >
        <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className={cn('text-[11px] font-black', !isTagalog ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')}>
          EN
        </span>
        <span className="text-slate-300 dark:text-slate-600 text-[10px]">|</span>
        <span className={cn('text-[11px] font-black', isTagalog ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')}>
          TL
        </span>
      </button>
    );
  }

  if (variant === 'expanded') {
    return (
      <button
        onClick={toggleLanguage}
        title={t('lang.switchPrompt')}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs border',
          isDark
            ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300',
          className
        )}
      >
        <Languages className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="font-extrabold">
          {language === 'en' ? 'English (EN)' : 'Tagalog (TL)'}
        </span>
      </button>
    );
  }

  // Compact default: Pure white background in light mode
  return (
    <button
      onClick={toggleLanguage}
      title={t('lang.switchPrompt')}
      aria-label={t('lang.switchPrompt')}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-xl p-2 px-2.5 shadow-xs border transition-all cursor-pointer text-xs font-extrabold select-none',
        isDark
          ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300',
        className
      )}
    >
      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <div className="flex items-center gap-1">
        <span className={cn('text-[11px] font-black', !isTagalog ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')}>
          EN
        </span>
        <span className="text-slate-300 dark:text-slate-600 text-[10px]">/</span>
        <span className={cn('text-[11px] font-black', isTagalog ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')}>
          TL
        </span>
      </div>
    </button>
  );
};
