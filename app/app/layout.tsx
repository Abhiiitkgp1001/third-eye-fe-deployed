'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, redirect } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { LayoutDashboard, Users, Building2, Settings, Shield, Menu, X, Bug, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const navigation = (peopleLists: number, companyLists: number) => [
  {
    name: 'Dashboard',
    href: '/app',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'People Lists',
    href: '/app/people',
    icon: Users,
    count: peopleLists,
  },
  {
    name: 'Company Lists',
    href: '/app/companies',
    icon: Building2,
    count: companyLists,
  },
  {
    name: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
  {
    name: 'Debug',
    href: '/app/debug',
    icon: Bug,
  },
];

function SidebarContent({
  pathname,
  user,
  onClose,
  onCollapse,
}: {
  pathname: string;
  user: ReturnType<typeof useUser>['user'];
  onClose?: () => void;
  onCollapse?: () => void;
}) {
  const { data: companyLists = [] } = trpc.companyLists.getAll.useQuery();
  const { data: peopleLists = [] } = trpc.peopleLists.getAll.useQuery();
  const navItems = navigation(peopleLists.length, companyLists.length);

  return (
    <div className="flex flex-col h-full bg-secondary-background border-r-2 border-border w-64">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b-2 border-border shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-base bg-main border-2 border-border flex items-center justify-center shadow-shadow">
              <Shield className="w-4 h-4 text-main-foreground" />
            </div>
            <span className="text-base font-heading text-foreground">Third Eye</span>
          </Link>
          <div className="w-6 h-px bg-border" />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-foreground/50 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="hidden lg:flex text-foreground/50 hover:text-foreground transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-base border-2 transition-all font-base text-sm',
                isActive
                  ? 'bg-main border-border text-main-foreground shadow-shadow'
                  : 'border-transparent text-foreground/60 hover:bg-background hover:border-border hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.count !== undefined && (
                <span className={cn(
                  'px-1.5 py-0.5 text-xs rounded-base border font-base',
                  isActive
                    ? 'bg-main-foreground/10 border-main-foreground/20 text-main-foreground'
                    : 'bg-background border-border text-foreground/50'
                )}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t-2 border-border shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-base border-2 border-border bg-background">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-7 h-7" },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-heading text-foreground truncate">
              {user?.firstName || 'User'}
            </p>
            <p className="text-xs text-foreground/50 font-base truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground font-heading text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="hidden lg:flex shrink-0 overflow-hidden"
          >
            <SidebarContent
              pathname={pathname}
              user={user}
              onCollapse={() => setSidebarCollapsed(true)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-overlay z-40 lg:hidden"
            />
            <motion.aside
              key="sidebar"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <SidebarContent
                pathname={pathname}
                user={user}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-secondary-background border-b-2 border-border flex items-center px-4 gap-4 shrink-0">
          {/* Mobile: open drawer */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-foreground/60 hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop: expand collapsed sidebar */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden lg:flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1" />

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 rounded-base bg-main border-2 border-border flex items-center justify-center">
              <Shield className="w-3 h-3 text-main-foreground" />
            </div>
            <span className="font-heading text-foreground text-sm">Third Eye</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            className="h-full"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
