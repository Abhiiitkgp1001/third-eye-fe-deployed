'use client';

import { motion } from 'framer-motion';
import { Bell, Rocket, Target, Zap, Check, ArrowRight, Sparkles, Users, TrendingUp, Building2, Briefcase, MapPin, DollarSign, Globe, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const eventWatchers = [
  {
    icon: Briefcase,
    title: "Job Posting with Keywords & Location",
    description: "Track postings containing certain keywords in the title or description posted in a specific location",
  },
  {
    icon: DollarSign,
    title: "New Funding Announcement",
    description: "Track new funding announcements for companies across all funding stages",
  },
  {
    icon: Bell,
    title: "Posts with Keywords",
    description: "Track LinkedIn posts containing specified keywords across all profiles and companies",
  },
  {
    icon: UserPlus,
    title: "Someone Starts a New Job",
    description: "Track when a person starts a new job or position anywhere",
  },
];

const companyWatchers = [
  {
    icon: TrendingUp,
    title: "Company Headcount Increased",
    description: "Track when a company's headcount increases by a specified percentage over one year",
  },
  {
    icon: MapPin,
    title: "Job Posting by Location",
    description: "Track postings with certain keywords posted in a specific location for a company",
  },
  {
    icon: Users,
    title: "Department Headcount in Range",
    description: "Track headcount of a specific department within defined ranges",
  },
  {
    icon: Sparkles,
    title: "First Person Hired in Department",
    description: "Track companies where the first person is hired in a given department",
  },
  {
    icon: Globe,
    title: "First Person Hired Internationally",
    description: "Track companies where first person is hired internationally",
  },
  {
    icon: Building2,
    title: "Employee Location in Two Countries",
    description: "Track companies where employee job location spans two countries",
  },
  {
    icon: Rocket,
    title: "Headcount Growth Over Baseline",
    description: "Track companies where headcount growth exceeds a defined baseline",
  },
];

const peopleWatchers = [
  {
    icon: Briefcase,
    title: "Job Change / New Role Start",
    description: "Track when tracked individuals change jobs or start new roles",
  },
  {
    icon: TrendingUp,
    title: "Promotion",
    description: "Get notified when someone gets promoted to a higher position",
  },
  {
    icon: Users,
    title: "Department Shift",
    description: "Track when people move between departments within the same company",
  },
  {
    icon: Building2,
    title: "Company Move",
    description: "Monitor when someone moves to a competitor or different industry",
  },
];

const steps = [
  {
    title: "Describe Your Signal",
    description: "Write what you want to track in plain English. No technical knowledge required.",
  },
  {
    title: "We Configure It",
    description: "Our AI understands your signal and sets up monitoring with the right parameters.",
  },
  {
    title: "Connect Integration",
    description: "Choose Slack channels or configure webhooks for your notifications.",
  },
  {
    title: "Get Notified",
    description: "Receive instant alerts when your custom signal triggers. That's it.",
  },
];

const earlyAccessFeatures = [
  "Lifetime early bird pricing when we launch",
  "Create unlimited custom signals in plain English",
  "Track any combination of events, companies, or people",
  "Slack & Webhook integrations",
  "Real-time notifications",
  "AI-powered signal understanding",
  "Priority support and onboarding",
  "Direct feedback channel to our team",
  "Shape product features and roadmap",
];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white overflow-hidden">
      {/* Sign In Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link
          href="/sign-in"
          className="px-6 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-semibold hover:bg-white/15 transition-all"
        >
          Sign In
        </Link>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Track profiles and companies like never before</span>
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Custom{' '}
            <span className="relative inline-block">
              <motion.span
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Watchers
              </motion.span>
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-30"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </span>
            <br />
            for Growth Signals
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Track job changes, funding announcements, company growth, hiring patterns, and custom events.
            <br />
            Get notified via <span className="text-blue-400 font-semibold">Slack</span> or <span className="text-purple-400 font-semibold">Webhooks</span> instantly.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.a
              href="mailto:onyxfounders@gmail.com?subject=Request%20Early%20Access%20-%20Third%20Eye"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg flex items-center gap-2 shadow-2xl"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              Request Early Access
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.button
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-semibold text-lg"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              whileTap={{ scale: 0.95 }}
            >
              See Demo
            </motion.button>
          </motion.div>

          {/* Floating Icons */}
          {isMounted && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    x: Math.random() * 1000 - 500,
                    y: Math.random() * 600 - 300,
                    opacity: 0
                  }}
                  animate={{
                    y: [null, Math.random() * 100 - 50],
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                >
                  <Bell className="w-6 h-6 text-purple-400" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom Signals Examples Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Define Signals in{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Plain English
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
              Create any custom signal you need. Just describe what you want to track, and we'll monitor it for you.
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Here are some examples of what you can track:
            </p>
          </motion.div>

          {/* Event Signals Examples */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold">Broad Event Signals</h3>
              <span className="text-sm text-gray-400 ml-2">(Examples)</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {eventWatchers.map((watcher, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className="relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <watcher.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">{watcher.title}</h4>
                        <p className="text-sm text-gray-400">{watcher.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Company Signals Examples */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold">Company Growth Signals</h3>
              <span className="text-sm text-gray-400 ml-2">(Examples)</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {companyWatchers.map((watcher, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className="relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <watcher.icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">{watcher.title}</h4>
                        <p className="text-sm text-gray-400">{watcher.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* People Signals Examples */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold">Individual Career Signals</h3>
              <span className="text-sm text-gray-400 ml-2">(Examples)</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {peopleWatchers.map((watcher, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className="relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <watcher.icon className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">{watcher.title}</h4>
                        <p className="text-sm text-gray-400">{watcher.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {index + 1}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Integrations Section */}
          <motion.div
            className="mt-24 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold mb-6">
              Get Notified{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Way
              </span>
            </h3>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Choose how you want to receive alerts. We integrate seamlessly with your existing workflow.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                className="p-8 bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-2xl font-bold mb-4">Slack Integration</h4>
                <p className="text-gray-400">
                  Receive instant notifications directly in your Slack channels. Keep your team aligned and responsive.
                </p>
              </motion.div>

              <motion.div
                className="p-8 bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-2xl font-bold mb-4">Webhooks</h4>
                <p className="text-gray-400">
                  Connect to any tool via webhooks. Automate your workflow and integrate with your custom systems.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Early Access Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Join{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Early Access
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Be among the first to experience the future of LinkedIn monitoring.
            </p>
          </motion.div>

          <motion.div
            className="relative group"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative p-12 bg-gradient-to-br from-slate-900/80 to-purple-900/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl">
              <div className="text-center">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-8"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">LIMITED SPOTS AVAILABLE</span>
                </motion.div>

                <div className="mb-8">
                  <h3 className="text-4xl font-bold mb-4">Get Exclusive Access</h3>
                  <p className="text-gray-300 text-lg max-w-xl mx-auto">
                    Join a select group of early adopters and help shape the future of LinkedIn signal tracking.
                  </p>
                </div>

                <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
                  {earlyAccessFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.a
                  href="mailto:onyxfounders@gmail.com?subject=Request%20Early%20Access%20-%20Third%20Eye"
                  className="block w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-2xl text-center"
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Request Early Access
                </motion.a>

                <p className="text-sm text-gray-400 mt-6">
                  No credit card required • Exclusive early bird pricing later
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to track
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                growth signals?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join early adopters who never miss critical events, company changes, or career moves.
            </p>

            <motion.a
              href="mailto:onyxfounders@gmail.com?subject=Request%20Early%20Access%20-%20Third%20Eye"
              className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl flex items-center gap-3 mx-auto shadow-2xl w-fit"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(168, 85, 247, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Request Early Access
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 Third Eye. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
