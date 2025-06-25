'use client';

import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NoSSR } from './no-ssr';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-md border border-input bg-background" />
    );
  }

  const themes = [
    { value: 'light', label: t('theme.light'), icon: Sun },
    { value: 'dark', label: t('theme.dark'), icon: Moon },
    { value: 'system', label: t('theme.system'), icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <NoSSR fallback={<div className="w-9 h-9 rounded-md border border-input bg-background" />}>
      <div className="relative">
        <button
          onClick={() => {
            const currentIndex = themes.findIndex(t => t.value === theme);
            const nextIndex = (currentIndex + 1) % themes.length;
            setTheme(themes[nextIndex].value);
          }}
          className="flex items-center justify-center w-9 h-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          title={currentTheme.label}
        >
          <currentTheme.icon className="w-4 h-4" />
        </button>
      </div>
    </NoSSR>
  );
}
