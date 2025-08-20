import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = (resolvedTheme || theme) === 'dark';

  return (
    <button
      className="tile fixed top-4 right-4 z-50 px-3 py-2 hover:opacity-90"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title="Toggle Dark Mode"
    >
      {isDark ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}
