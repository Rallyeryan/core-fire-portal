import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';

export function ThemeToggle({ variant = 'default' }: { variant?: 'default' | 'sidebar' }) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        className="w-full text-[10px] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors py-2 px-3 rounded-lg hover:bg-sidebar-accent flex items-center gap-1.5 justify-center uppercase tracking-wider"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
        {theme === 'dark' ? 'Light' : 'Dark'} mode
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}
