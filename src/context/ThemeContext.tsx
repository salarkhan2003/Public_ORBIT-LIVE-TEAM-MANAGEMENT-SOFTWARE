import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from 'framer-motion';

// Theme variant type
export interface ThemeVariant {
  id: string;
  name: string;
  accentGradient: string; // tailwind gradient classes
  accentFrom: string;
  accentTo: string;
  bg: string;
  ring: string;
  textAccent: string;
}

interface ThemeContextValue {
  variant: ThemeVariant;
  setVariantById: (id: string) => void;
  variants: ThemeVariant[];
  reducedMotion: boolean;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const VARIANTS: ThemeVariant[] = [
  {
    id: 'orbit',
    name: 'Orbit Core',
    accentGradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
    accentFrom: 'from-blue-600',
    accentTo: 'to-purple-600',
    bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
    ring: 'ring-blue-500/40',
    textAccent: 'text-blue-400'
  },
  {
    id: 'sunset',
    name: 'Sunset Bloom',
    accentGradient: 'bg-gradient-to-r from-orange-500 via-pink-500 to-rose-600',
    accentFrom: 'from-orange-500',
    accentTo: 'to-rose-600',
    bg: 'bg-gradient-to-br from-zinc-900 via-neutral-800 to-zinc-900',
    ring: 'ring-orange-500/40',
    textAccent: 'text-orange-400'
  },
  {
    id: 'aqua',
    name: 'Aqua Pulse',
    accentGradient: 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600',
    accentFrom: 'from-cyan-500',
    accentTo: 'to-emerald-600',
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    ring: 'ring-cyan-500/40',
    textAccent: 'text-cyan-400'
  },
  {
    id: 'violet',
    name: 'Violet Flux',
    accentGradient: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-600',
    accentFrom: 'from-violet-500',
    accentTo: 'to-pink-600',
    bg: 'bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950',
    ring: 'ring-violet-500/40',
    textAccent: 'text-violet-400'
  }
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [variantId, setVariantId] = useState<string>(() => localStorage.getItem('variant') || 'orbit');

  useEffect(() => {
    localStorage.setItem('variant', variantId);
  }, [variantId]);

  const variant = useMemo(() => VARIANTS.find(v => v.id === variantId) || VARIANTS[0], [variantId]);

  const setVariantById = (id: string) => setVariantId(id);

  return (
    <ThemeContext.Provider value={{ variant, setVariantById, variants: VARIANTS, reducedMotion, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeVariant() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeVariant must be used within ThemeProvider');
  return ctx;
}

