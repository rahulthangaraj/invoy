import { type ReactNode } from 'react';

interface TopbarProps {
  title: string;
  actions?: ReactNode;
}

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-background sticky top-0 z-10">
      <h1 className="text-base font-semibold text-text-primary tracking-tight">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
