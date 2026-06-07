'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronLeft, Check } from 'lucide-react';

type Tone = 'neutral' | 'blue' | 'red' | 'green' | 'amber' | 'teal' | 'slate' | 'violet';

const toneClasses: Record<Tone, { selected: string; idle: string; swatch: string }> = {
  neutral: {
    selected: 'border-neutral-900 bg-neutral-950 text-white shadow-neutral-900/15',
    idle: 'border-neutral-200 bg-white text-neutral-950 hover:border-neutral-400',
    swatch: 'bg-neutral-900',
  },
  blue: {
    selected: 'border-blue-700 bg-blue-950 text-white shadow-blue-900/15',
    idle: 'border-blue-100 bg-blue-50/60 text-blue-950 hover:border-blue-300',
    swatch: 'bg-blue-600',
  },
  red: {
    selected: 'border-red-700 bg-red-950 text-white shadow-red-900/15',
    idle: 'border-red-100 bg-red-50/70 text-red-950 hover:border-red-300',
    swatch: 'bg-red-600',
  },
  green: {
    selected: 'border-emerald-700 bg-emerald-950 text-white shadow-emerald-900/15',
    idle: 'border-emerald-100 bg-emerald-50/70 text-emerald-950 hover:border-emerald-300',
    swatch: 'bg-emerald-600',
  },
  amber: {
    selected: 'border-amber-700 bg-amber-950 text-white shadow-amber-900/15',
    idle: 'border-amber-100 bg-amber-50/70 text-amber-950 hover:border-amber-300',
    swatch: 'bg-amber-500',
  },
  teal: {
    selected: 'border-teal-700 bg-teal-950 text-white shadow-teal-900/15',
    idle: 'border-teal-100 bg-teal-50/70 text-teal-950 hover:border-teal-300',
    swatch: 'bg-teal-600',
  },
  slate: {
    selected: 'border-slate-700 bg-slate-950 text-white shadow-slate-900/15',
    idle: 'border-slate-200 bg-slate-50/80 text-slate-950 hover:border-slate-400',
    swatch: 'bg-slate-800',
  },
  violet: {
    selected: 'border-violet-700 bg-violet-950 text-white shadow-violet-900/15',
    idle: 'border-violet-100 bg-violet-50/70 text-violet-950 hover:border-violet-300',
    swatch: 'bg-violet-600',
  },
};

interface PlaySetupCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function PlaySetupCard({ title, subtitle, children, className = '' }: PlaySetupCardProps) {
  return (
    <section className={`mx-auto w-full max-w-2xl rounded-lg border border-white/10 bg-white/95 p-3 shadow-xl sm:p-5 ${className}`}>
      <div className="mb-3 border-b border-neutral-200 pb-3 sm:mb-4">
        <h2 className="text-lg font-bold leading-tight text-neutral-950 sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-xs leading-5 text-neutral-600 sm:text-sm">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

interface SetupOptionButtonProps {
  title: string;
  description?: string;
  meta?: string;
  selected?: boolean;
  onClick: () => void;
  tone?: Tone;
  className?: string;
}

export function SetupOptionButton({
  title,
  description,
  meta,
  selected = false,
  onClick,
  tone = 'neutral',
  className = '',
}: SetupOptionButtonProps) {
  const styles = toneClasses[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[80px] w-full items-start gap-2.5 rounded-lg border p-3 text-left shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-teal-300 sm:min-h-[88px] sm:p-4 ${
        selected ? styles.selected : styles.idle
      } ${className}`}
    >
      <span className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${selected ? 'bg-white' : styles.swatch}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-bold leading-tight sm:text-base">
          {title}
          {selected && <Check className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
        </span>
        {description && (
          <span className={`mt-1 block text-xs leading-5 sm:text-sm ${selected ? 'text-white/75' : 'text-neutral-600'}`}>
            {description}
          </span>
        )}
        {meta && (
          <span className={`mt-2 block text-xs font-semibold ${selected ? 'text-white/70' : 'text-neutral-500'}`}>
            {meta}
          </span>
        )}
      </span>
    </button>
  );
}

interface SetupHintProps {
  children: ReactNode;
  tone?: 'info' | 'warning';
}

export function SetupHint({ children, tone = 'info' }: SetupHintProps) {
  const classes =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-950'
      : 'border-teal-200 bg-teal-50 text-teal-950';

  return (
    <div className={`rounded-lg border px-3 py-2 text-xs leading-5 sm:px-4 sm:py-3 sm:text-sm ${classes}`}>
      {children}
    </div>
  );
}

export function SetupBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus:ring-4 focus:ring-teal-300"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
