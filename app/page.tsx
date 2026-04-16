'use client';

import { motion } from 'framer-motion';
import { Building2, Users, Bell, TrendingUp, Shield, Zap, Check, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

const exampleSignals = [
  "Notify me when a Series A SaaS company posts a Head of Sales role.",
  "Alert me when any YC company hires their first designer.",
  "Track when CTOs at fintechs under 50 people tweet about hiring.",
  "Ping me when a healthcare startup raises a Series B and has no VP Marketing.",
  "Track when developer-tool companies change their pricing page.",
  "Alert me when a portfolio company of a16z posts an AI/ML role.",
];

const features = [
  {
    icon: Building2,
    title: 'Track Companies',
    description: 'Monitor company growth, hiring patterns, and funding announcements in real-time.',
  },
  {
    icon: Users,
    title: 'Monitor People',
    description: 'Track career moves, job changes, and professional milestones of key individuals.',
  },
  {
    icon: Bell,
    title: 'Get Instant Alerts',
    description: 'Receive notifications via Slack or webhooks the moment something important happens.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create Lists',
    description: 'Build lists of companies or people you want to track.',
  },
  {
    number: '02',
    title: 'Define Signals',
    description: 'Set up custom watchers for specific growth signals.',
  },
  {
    number: '03',
    title: 'Get Notified',
    description: 'Receive instant alerts when signals trigger.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-base bg-main border-2 border-border flex items-center justify-center shadow-shadow">
              <Shield className="w-4 h-4 text-main-foreground" />
            </div>
            <span className="text-lg font-heading text-foreground">Third Eye</span>
          </Link>
          <Link href="/sign-in">
            <Button variant="noShadow" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-main border-2 border-border shadow-shadow rounded-base"
            >
              <Zap className="w-3.5 h-3.5 text-main-foreground" />
              <span className="text-xs font-heading text-main-foreground uppercase tracking-widest">
                Growth Intelligence Platform
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-heading text-foreground mb-6 leading-none tracking-tight">
              Describe the signal.
              <br />
              <span className="text-main">In plain English.</span>
              <br />
              We'll monitor it.
            </h1>

            <p className="text-lg text-foreground/60 mb-10 max-w-xl font-base leading-relaxed">
              Stop settling for generic firehoses. Get the exact buying signals that match your ICP — from job posts to funding rounds to any custom trigger.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              {/* TODO: Replace with actual Calendly URL */}
              <Link href="https://calendly.com/thirdeye/demo" target="_blank" rel="noopener noreferrer">
                <Button size="lg">
                  Book a Demo <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="neutral" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Example Signals Section */}
      <section className="py-20 px-6 border-t-2 border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              Signals you can't get
              <br />
              anywhere else.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {exampleSignals.map((signal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-background border-2 border-border shadow-shadow rounded-base p-5 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-base bg-main/10 border-2 border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Search className="w-4 h-4 text-main" />
                  </div>
                  <p className="text-foreground/80 font-base text-sm leading-relaxed">
                    "{signal}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t-2 border-border bg-secondary-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              Everything you need
              <br />
              to stay ahead.
            </h2>
            <p className="text-foreground/60 font-base">
              Powerful monitoring tools designed for modern teams
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-background border-2 border-border shadow-shadow rounded-base p-6 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
              >
                <div className="w-10 h-10 rounded-base bg-main border-2 border-border flex items-center justify-center mb-5">
                  <feature.icon className="w-5 h-5 text-main-foreground" />
                </div>
                <h3 className="text-lg font-heading text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/60 font-base text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t-2 border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-foreground/60 font-base">Get started in minutes</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className="border-2 border-border rounded-base p-6 bg-secondary-background shadow-shadow"
              >
                <span className="text-5xl font-heading text-main leading-none block mb-4">
                  {step.number}
                </span>
                <h3 className="text-lg font-heading text-foreground mb-2">{step.title}</h3>
                <p className="text-foreground/60 font-base text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t-2 border-border bg-main">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-heading text-main-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-main-foreground/70 font-base text-lg mb-8">
              Join teams who never miss critical growth signals
            </p>

            <div className="flex flex-wrap gap-4 items-center mb-10">
              <Link href="/sign-in">
                <Button variant="neutral" size="lg">
                  Start Tracking Now <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-main-foreground/70 font-base">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-main-foreground" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-main-foreground" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-main-foreground" />
                <span>Setup in minutes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t-2 border-border bg-background">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-base bg-main border-2 border-border flex items-center justify-center">
              <Shield className="w-3 h-3 text-main-foreground" />
            </div>
            <span className="text-sm font-heading text-foreground">Third Eye</span>
          </div>
          <p className="text-foreground/40 text-sm font-base">&copy; 2025 Third Eye. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
