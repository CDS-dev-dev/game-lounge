'use client';

import React from 'react';

type Tone = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';

const toneClasses: Record<Tone, string> = {
  primary:
    'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-300',
  secondary:
    'border-slate-700 bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-300',
  danger:
    'border-red-700 bg-red-700 text-white hover:bg-red-800 focus:ring-red-300',
  warning:
    'border-amber-600 bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-300',
  ghost:
    'border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-300',
};

export function GameScreen({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto flex min-h-0 w-full max-w-6xl flex-col gap-2 overflow-x-hidden px-2 pb-2 sm:gap-3 sm:px-4 ${className}`}>
      {children}
    </div>
  );
}

export function GameStatePanel({
  title,
  subtitle,
  items,
  status,
  className = '',
}: {
  title: string;
  subtitle?: string;
  items?: Array<{ label: string; value: React.ReactNode; emphasis?: boolean }>;
  status?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm sm:p-3 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold leading-tight text-neutral-950 sm:text-lg">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-neutral-600">{subtitle}</p> : null}
        </div>
        {status ? (
          <div className="rounded-md bg-neutral-100 px-3 py-1 text-sm font-bold text-neutral-800">
            {status}
          </div>
        ) : null}
      </div>

      {items?.length ? (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className={`rounded-md border px-2.5 py-1.5 ${
                item.emphasis
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-neutral-200 bg-neutral-50'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                {item.label}
              </div>
              <div className="mt-1 text-base font-bold text-neutral-950">{item.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function PlayerStatusCard({
  name,
  chips,
  bet,
  note,
  action,
  isActive,
  isFolded,
  position,
  children,
}: {
  name: string;
  chips?: number;
  bet?: number;
  note?: React.ReactNode;
  action?: React.ReactNode;
  isActive?: boolean;
  isFolded?: boolean;
  position?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-lg border bg-white p-2.5 shadow-sm sm:p-3 ${
        isActive ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-neutral-200'
      } ${isFolded ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-neutral-950 sm:text-base">{name}</h3>
            {position ? (
              <span className="rounded-md bg-neutral-900 px-2 py-0.5 text-[11px] font-bold text-white">
                {position}
              </span>
            ) : null}
          </div>
          {note ? <div className="mt-1 text-xs font-medium text-neutral-600">{note}</div> : null}
        </div>
        {action ? (
          <div className="shrink-0 rounded-md bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-800">
            {action}
          </div>
        ) : null}
      </div>

      {(chips !== undefined || bet !== undefined) && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {chips !== undefined ? (
            <div className="rounded-md bg-neutral-50 px-2 py-1">
              <span className="text-xs text-neutral-500">チップ</span>
              <div className="font-bold text-neutral-950">{chips.toLocaleString()}</div>
            </div>
          ) : null}
          {bet !== undefined ? (
            <div className="rounded-md bg-neutral-50 px-2 py-1">
              <span className="text-xs text-neutral-500">ベット</span>
              <div className="font-bold text-neutral-950">{bet.toLocaleString()}</div>
            </div>
          ) : null}
        </div>
      )}

      {children ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

export function ActionButton({
  children,
  onClick,
  tone = 'primary',
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: Tone;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-10 rounded-lg border px-3 py-1.5 text-sm font-bold transition-colors focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:py-2 sm:text-base ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}

export function ActionButtonGroup({
  title = '次の操作',
  subtitle,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-neutral-200 bg-white p-2 shadow-xl sm:p-2.5 ${className}`}>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 sm:mb-2">
        <h2 className="text-xs font-bold text-neutral-950 sm:text-base">{title}</h2>
        {subtitle ? <div className="text-[11px] font-semibold text-neutral-600 sm:text-sm">{subtitle}</div> : null}
      </div>
      <div className="grid grid-cols-4 gap-2">{children}</div>
    </section>
  );
}

export function BottomActionArea({ children }: { children: React.ReactNode }) {
  return (
    <div data-game-action-area className="z-20 mx-auto w-full max-w-3xl">
      {children}
    </div>
  );
}

export function GameLog({
  items,
  empty = 'まだアクションはありません',
}: {
  items: Array<React.ReactNode>;
  empty?: string;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
      <h2 className="text-sm font-bold text-neutral-950">直近の動き</h2>
      <div className="mt-2 space-y-1 text-sm text-neutral-700">
        {items.length ? items.map((item, index) => <div key={index}>{item}</div>) : <div>{empty}</div>}
      </div>
    </section>
  );
}
