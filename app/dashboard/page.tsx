'use client';

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter, usePathname } from "next/navigation";

type ListType = 'company' | 'people';

interface List {
  id: string;
  name: string;
  type: ListType;
  items: string[];
  createdAt: Date;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [lists, setLists] = useState<List[]>([]);

  // Load lists from localStorage on mount
  useEffect(() => {
    const savedLists = localStorage.getItem('trackingLists');
    if (savedLists) {
      const parsedLists = JSON.parse(savedLists);
      const listsWithDates = parsedLists.map((list: any) => ({
        ...list,
        createdAt: new Date(list.createdAt)
      }));
      setLists(listsWithDates);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jungle-teal-950 via-muted-teal-900 to-frozen-water-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  const companyLists = lists.filter(list => list.type === 'company');
  const peopleLists = lists.filter(list => list.type === 'people');

  return (
    <div className="min-h-screen bg-gradient-to-br from-jungle-teal-950 via-muted-teal-900 to-frozen-water-900 flex">
      {/* Sidebar */}
      <aside className="w-64 backdrop-blur-xl bg-jungle-teal-900/95 border-r border-jungle-teal-700/40 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-jungle-teal-700/40">
          <h2 className="text-white font-semibold text-lg">Navigation</h2>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard/companies"
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              pathname === '/dashboard/companies'
                ? 'bg-gradient-to-r from-jungle-teal-600 to-muted-teal-600 shadow-lg'
                : 'bg-jungle-teal-800/90 hover:bg-jungle-teal-700/90'
            }`}
          >
            <span className="text-2xl">🏢</span>
            <div className="flex-1">
              <p className="text-white font-medium">Companies</p>
              <p className="text-muted-teal-50 text-xs">{companyLists.length} lists</p>
            </div>
          </Link>

          <Link
            href="/dashboard/people"
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              pathname === '/dashboard/people'
                ? 'bg-gradient-to-r from-frozen-water-600 to-azure-mist-600 shadow-lg'
                : 'bg-jungle-teal-800/90 hover:bg-jungle-teal-700/90'
            }`}
          >
            <span className="text-2xl">👥</span>
            <div className="flex-1">
              <p className="text-white font-medium">People</p>
              <p className="text-muted-teal-50 text-xs">{peopleLists.length} lists</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="backdrop-blur-xl bg-jungle-teal-900/95 border-b border-jungle-teal-700/40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white text-xl font-bold">
                Third Eye
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white">
                {user?.firstName || user?.emailAddresses[0].emailAddress}
              </span>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
              <p className="text-white">Welcome to your tracking dashboard</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="backdrop-blur-xl bg-jungle-teal-900/95 rounded-xl border border-jungle-teal-700/40 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-teal-50 text-sm">Total Lists</p>
                    <p className="text-white text-3xl font-semibold mt-1">{lists.length}</p>
                  </div>
                  <div className="text-5xl">📋</div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-jungle-teal-900/95 rounded-xl border border-jungle-teal-700/40 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-teal-50 text-sm">Company Lists</p>
                    <p className="text-white text-3xl font-semibold mt-1">{companyLists.length}</p>
                  </div>
                  <div className="text-5xl">🏢</div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-jungle-teal-900/95 rounded-xl border border-jungle-teal-700/40 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-teal-50 text-sm">People Lists</p>
                    <p className="text-white text-3xl font-semibold mt-1">{peopleLists.length}</p>
                  </div>
                  <div className="text-5xl">👥</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="backdrop-blur-xl bg-jungle-teal-900/95 rounded-2xl border border-jungle-teal-700/40 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => router.push('/dashboard/companies')}
                  className="backdrop-blur-xl bg-jungle-teal-800/90 hover:bg-jungle-teal-900/90 border border-jungle-teal-700/30 rounded-xl p-6 transition-all text-left group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl">🏢</div>
                    <h3 className="text-white font-bold text-xl">Manage Companies</h3>
                  </div>
                  <p className="text-muted-teal-50">View and manage your company tracking lists</p>
                  <div className="mt-4 flex items-center text-jungle-teal-400 group-hover:text-jungle-teal-300 transition-colors">
                    <span className="text-sm font-medium">Go to Companies</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/dashboard/people')}
                  className="backdrop-blur-xl bg-jungle-teal-800/90 hover:bg-jungle-teal-900/90 border border-jungle-teal-700/30 rounded-xl p-6 transition-all text-left group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl">👥</div>
                    <h3 className="text-white font-bold text-xl">Manage People</h3>
                  </div>
                  <p className="text-muted-teal-50">View and manage your people tracking lists</p>
                  <div className="mt-4 flex items-center text-frozen-water-400 group-hover:text-frozen-water-300 transition-colors">
                    <span className="text-sm font-medium">Go to People</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            {lists.length > 0 && (
              <div className="mt-8 backdrop-blur-xl bg-jungle-teal-900/95 rounded-2xl border border-jungle-teal-700/40 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Lists</h2>
                <div className="space-y-3">
                  {lists.slice(0, 5).map((list) => (
                    <div
                      key={list.id}
                      onClick={() => router.push(`/dashboard/list/${list.id}`)}
                      className="flex items-center justify-between p-4 bg-jungle-teal-800/90 hover:bg-jungle-teal-700/90 rounded-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {list.type === 'company' ? '🏢' : '👥'}
                        </span>
                        <div>
                          <p className="text-white font-medium">{list.name}</p>
                          <p className="text-muted-teal-50 text-sm">
                            {list.items.length} items • Created {new Date(list.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-muted-teal-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
