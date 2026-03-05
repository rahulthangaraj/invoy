'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Users, Settings, LogOut, Zap, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Invoices', icon: FileText },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/' || pathname.startsWith('/invoices');
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const link = (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center h-9 rounded-md text-sm font-medium transition-colors duration-150',
                collapsed ? 'justify-center px-0 w-9 mx-auto' : 'gap-2.5 px-3',
                isActive(href)
                  ? 'bg-sidebar-active text-sidebar-text-active font-medium'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active',
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
              {!collapsed && label}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={href} delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>

      <div className="px-2 pb-3 border-t border-border pt-3">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-9 h-9 mx-auto rounded-md text-sm font-medium text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-colors duration-150"
              >
                <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 h-9 w-full rounded-md text-sm font-medium text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-colors duration-150"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
            Sign out
          </button>
        )}
      </div>
    </>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  return (
    <TooltipProvider>
      {/* Desktop sidebar — light, Linear-style */}
      <aside
        className={cn(
          'hidden md:flex flex-col shrink-0 h-screen bg-sidebar-bg border-r border-border sticky top-0 transition-all duration-200',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Logo + collapse toggle */}
        <div
          className={cn(
            'flex items-center h-14 border-b border-border relative',
            collapsed ? 'justify-center px-0' : 'px-4 gap-2',
          )}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary shrink-0">
            <Zap className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          {!collapsed && (
            <span className="text-text-primary font-semibold text-sm tracking-tight">Invoy</span>
          )}
          <button
            onClick={toggleCollapsed}
            className={cn(
              'absolute flex items-center justify-center w-5 h-5 rounded-full bg-secondary border border-border text-text-tertiary hover:text-text-primary transition-colors -right-2.5 top-1/2 -translate-y-1/2',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>
        </div>

        <NavLinks collapsed={collapsed} />
      </aside>

      {/* Mobile header bar — light */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 bg-sidebar-bg border-b border-border">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
            <Zap className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-text-primary font-semibold text-sm tracking-tight">Invoy</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary hover:bg-sidebar-hover px-2">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 p-0 bg-sidebar-bg border-r border-border [&>button]:text-text-tertiary [&>button]:hover:text-text-primary"
          >
            <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
                <Zap className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-text-primary font-semibold text-sm tracking-tight">Invoy</span>
            </div>
            <div className="flex flex-col h-[calc(100%-3.5rem)]">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}
