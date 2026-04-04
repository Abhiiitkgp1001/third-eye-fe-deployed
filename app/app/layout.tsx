'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, redirect } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  // Fetch lists for sidebar counts
  const { data: companyLists = [] } = trpc.companyLists.getAll.useQuery();
  const { data: peopleLists = [] } = trpc.peopleLists.getAll.useQuery();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-secondary-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-secondary-900 flex">
      {/* Sidebar */}
      <aside className="w-64 backdrop-blur-xl bg-primary-900/95 border-r border-primary-700/40 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-primary-700/40">
          <h2 className="text-white font-semibold text-lg">Navigation</h2>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 p-4 space-y-2">
          <Link
            href="/app/companies"
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              pathname === '/app/companies'
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg'
                : 'bg-primary-800/90 hover:bg-primary-700/90'
            }`}
          >
            <span className="text-2xl">🏢</span>
            <div className="flex-1">
              <p className="text-white font-medium">Companies</p>
              <p className="text-secondary-50 text-xs">{companyLists.length} lists</p>
            </div>
          </Link>

          <Link
            href="/app/people"
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              pathname === '/app/people'
                ? 'bg-gradient-to-r from-tertiary-600 to-secondary-600 shadow-lg'
                : 'bg-primary-800/90 hover:bg-primary-700/90'
            }`}
          >
            <span className="text-2xl">👥</span>
            <div className="flex-1">
              <p className="text-white font-medium">People</p>
              <p className="text-secondary-50 text-xs">{peopleLists.length} lists</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="backdrop-blur-xl bg-primary-900/95 border-b border-primary-700/40">
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
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
