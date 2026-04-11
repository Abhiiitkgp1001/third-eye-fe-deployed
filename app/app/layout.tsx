'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, redirect } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { LayoutDashboard, Users, Building2, Settings, LogOut, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch lists for sidebar counts
  const { data: companyLists = [] } = trpc.companyLists.getAll.useQuery();
  const { data: peopleLists = [] } = trpc.peopleLists.getAll.useQuery();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/app',
      icon: LayoutDashboard,
      current: pathname === '/app',
    },
    {
      name: 'People Lists',
      href: '/app/people',
      icon: Users,
      current: pathname.startsWith('/app/people'),
      count: peopleLists.length,
    },
    {
      name: 'Company Lists',
      href: '/app/companies',
      icon: Building2,
      current: pathname.startsWith('/app/companies'),
      count: companyLists.length,
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
      current: pathname === '/app/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-400 flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={false}
          animate={sidebarOpen ? { x: 0 } : { x: -280 }}
          className="fixed lg:static inset-y-0 left-0 w-64 glass border-r border-gray-800 flex flex-col z-50 lg:translate-x-0 transition-transform"
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Third Eye</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                    item.current
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-dark-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.current ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="flex-1 font-medium">{item.name}</span>
                  {item.count !== undefined && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      item.current ? 'bg-brand-500/20 text-brand-300' : 'bg-dark-200 text-gray-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName || user?.emailAddresses[0].emailAddress}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.emailAddresses[0].emailAddress}
                </p>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <nav className="h-16 glass border-b border-gray-800 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="hidden lg:flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Welcome back, {user?.firstName || 'User'}
            </span>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
