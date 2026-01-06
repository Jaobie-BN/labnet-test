
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeDefinition';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-bg-surface text-text-primary hover:bg-bg-surface-hover hover:text-brand-primary transition-all border border-border-subtle shadow-sm"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
};
