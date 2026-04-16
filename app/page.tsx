'use client';

import { motion } from 'framer-motion';
import { Building2, Users, Bell, TrendingUp, Shield, Zap, Check, ArrowRight, Search, MessageSquare, Clock, Database, Webhook, Play, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

const scrollToDemo = () => {
  const demoSection = document.getElementById('demo-video');
  if (demoSection) {
    demoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

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
    icon: MessageSquare,
    title: 'Plain-English signal builder',
    description: 'Describe what you want to track. No rigid filters, no boolean logic.',
  },
  {
    icon: Clock,
    title: 'Real-time, not batch',
    description: 'Signals fire the moment they happen — not next week's data dump.',
  },
  {
    icon: Database,
    title: 'Multi-source aggregation',
    description: 'LinkedIn, job boards, news, funding databases, social — unified.',
  },
  {
    icon: Webhook,
    title: 'Delivered where you work',
    description: 'Slack, webhooks, or directly into your CRM.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Describe your signal',
    description: 'Track Series B fintechs hiring a VP Engineering.',
    mockup: 'input', // Shows an input field mockup
  },
  {
    number: '02',
    title: 'Third Eye monitors in real-time',
    description: 'We continuously scan across all sources.',
    mockup: 'cards', // Shows preview cards of matched companies
  },
  {
    number: '03',
    title: 'Get notified instantly',
    description: 'Slack, webhook, or email the moment it happens.',
    mockup: 'slack', // Shows a mock Slack notification
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
              <Button variant="neutral" size="lg" onClick={scrollToDemo}>
                See Demo
              </Button>
            </div>

            {/* Customer Logo Strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-16 pt-8 border-t-2 border-border/30"
            >
              <p className="text-foreground/40 text-xs font-heading uppercase tracking-widest mb-6 text-center">
                Trusted by
              </p>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                {/* TODO: Add HireCaddie logo */}
                <div className="grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all">
                  <div className="h-8 px-6 flex items-center justify-center bg-foreground/5 border-2 border-border rounded-base">
                    <span className="text-sm font-heading text-foreground/60">HireCaddie</span>
                  </div>
                </div>

                {/* TODO: Add customer logo 2 */}
                <div className="grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all">
                  <div className="h-8 px-6 flex items-center justify-center bg-foreground/5 border-2 border-border rounded-base">
                    <span className="text-sm font-heading text-foreground/60">Customer 2</span>
                  </div>
                </div>

                {/* TODO: Add customer logo 3 */}
                <div className="grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all">
                  <div className="h-8 px-6 flex items-center justify-center bg-foreground/5 border-2 border-border rounded-base">
                    <span className="text-sm font-heading text-foreground/60">Customer 3</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="py-20 px-6 border-t-2 border-border bg-secondary-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-3">
              See Third Eye in action
            </h2>
            <p className="text-foreground/60 font-base">Watch how easy it is to set up custom signals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-base border-4 border-border bg-background shadow-[12px_12px_0_0_var(--border)] overflow-hidden"
            style={{ aspectRatio: '16/9' }}
          >
            {/* TODO: Replace with Loom embed URL once demo is recorded */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-main/20 to-main/5">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-main border-4 border-border flex items-center justify-center mx-auto mb-4 shadow-shadow">
                  <Play className="w-8 h-8 text-main-foreground ml-1" />
                </div>
                <p className="text-foreground/60 font-base text-sm">
                  Demo video coming soon
                </p>
              </div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <h3 className="text-lg font-heading text-foreground mb-3">{step.title}</h3>
                <p className="text-foreground/60 font-base text-sm mb-4">{step.description}</p>

                {/* Mockup visualizations */}
                {step.mockup === 'input' && (
                  <div className="mt-4 p-3 bg-background border-2 border-border rounded-base">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-foreground/40" />
                      <span className="text-sm text-foreground/70 font-base">
                        Track Series B fintechs hiring a VP Engineering
                      </span>
                    </div>
                  </div>
                )}

                {step.mockup === 'cards' && (
                  <div className="mt-4 space-y-2">
                    {/* TODO: Replace with real product screenshots */}
                    {['FintechCo', 'PaymentsPro'].map((company) => (
                      <div
                        key={company}
                        className="p-3 bg-background border-2 border-border rounded-base flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded bg-main/20 border border-border flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-main" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-heading text-foreground">{company}</p>
                          <p className="text-[10px] text-foreground/50">Series B • Hiring VP Eng</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step.mockup === 'slack' && (
                  <div className="mt-4 p-3 bg-background border-2 border-border rounded-base">
                    {/* TODO: Replace with real Slack notification screenshot */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded bg-main flex items-center justify-center shrink-0">
                        <Bell className="w-3 h-3 text-main-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-heading text-foreground mb-1">Third Eye Alert</p>
                        <p className="text-[10px] text-foreground/60 leading-relaxed">
                          <strong>FintechCo</strong> just posted a VP Engineering role. Series B, 45 employees.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Book a Demo Section */}
      <section className="py-20 px-6 border-t-2 border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left Column */}
            <div>
              <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-6">
                See Third Eye on
                <br />
                <span className="text-main">your actual signals.</span>
              </h2>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-base bg-main border-2 border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-main-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground font-base font-semibold">15-minute call</p>
                    <p className="text-foreground/60 text-sm">Quick, no-pressure walkthrough</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-base bg-main border-2 border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-main-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground font-base font-semibold">Live demo with your ICP</p>
                    <p className="text-foreground/60 text-sm">See how Third Eye tracks your exact targets</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-base bg-main border-2 border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-main-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground font-base font-semibold">Custom signal built on the spot</p>
                    <p className="text-foreground/60 text-sm">Walk away with a working signal</p>
                  </div>
                </li>
              </ul>

              {/* TODO: Replace with actual Calendly URL */}
              <Link href="https://calendly.com/thirdeye/demo" target="_blank" rel="noopener noreferrer">
                <Button size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Your Demo
                </Button>
              </Link>
            </div>

            {/* Right Column - Calendly Embed Placeholder */}
            <div>
              <div className="relative rounded-base border-4 border-border bg-secondary-background shadow-[8px_8px_0_0_var(--border)] overflow-hidden">
                <div className="aspect-[3/4] flex items-center justify-center p-8">
                  {/* TODO: Replace with Calendly inline embed */}
                  <div className="text-center">
                    <Calendar className="w-16 h-16 text-main mx-auto mb-4" />
                    <p className="text-foreground/60 font-base">
                      Calendly embed will appear here
                    </p>
                    <p className="text-foreground/40 font-base text-sm mt-2">
                      Once you provide the inline embed code
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
              {/* TODO: Confirm the real number before deploy */}
              Join 25+ teams tracking custom signals in real-time.
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
