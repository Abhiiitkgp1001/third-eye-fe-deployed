'use client';

import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { Building2, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const { organization } = useOrganization();

  // Fetch lists using tRPC
  const { data: companyLists = [], isLoading: isLoadingCompany } = trpc.companyLists.getAll.useQuery();
  const { data: peopleLists = [], isLoading: isLoadingPeople } = trpc.peopleLists.getAll.useQuery();

  const totalLists = companyLists.length + peopleLists.length;
  const isLoading = isLoadingCompany || isLoadingPeople;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Lists',
      value: totalLists,
      icon: TrendingUp,
      color: 'brand',
    },
    {
      label: 'Company Lists',
      value: companyLists.length,
      icon: Building2,
      color: 'blue',
    },
    {
      label: 'People Lists',
      value: peopleLists.length,
      icon: Users,
      color: 'purple',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Companies',
      description: 'View and manage your company tracking lists',
      icon: Building2,
      href: '/app/companies',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Manage People',
      description: 'View and manage your people tracking lists',
      icon: Users,
      href: '/app/people',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">
          Welcome to your tracking dashboard{organization?.name ? `, ${organization.name}` : ''}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg hover:shadow-brand-500/10 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                      <Icon className="w-6 h-6 text-brand-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={() => router.push(action.href)}
                    className="glass-hover p-6 rounded-lg text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{action.description}</p>
                        <div className="flex items-center text-brand-400 group-hover:text-brand-300 transition-colors">
                          <span className="text-sm font-medium">Go to {action.title}</span>
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Lists */}
      {totalLists > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Lists</CardTitle>
              <CardDescription>Your most recently created lists</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...peopleLists, ...companyLists].slice(0, 5).map((list, index) => (
                  <motion.button
                    key={list.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    onClick={() => router.push(`/app/${peopleLists.includes(list) ? 'people' : 'companies'}/${list.id}`)}
                    className="w-full flex items-center justify-between p-4 glass-hover rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      {peopleLists.includes(list) ? (
                        <Users className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Building2 className="w-5 h-5 text-blue-400" />
                      )}
                      <div className="text-left">
                        <p className="text-white font-medium">{list.name}</p>
                        <p className="text-sm text-gray-400">
                          Created {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
