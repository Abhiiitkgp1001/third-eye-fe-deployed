'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Check, ArrowRight, Search, Bot, Network, Code2, Brain, Webhook, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';

const exampleSignals = [
  "Agent queries: 'Find companies that just raised Series A and need a Head of Sales'",
  "Agent monitors: 'Alert when any YC company posts their first design role'",
  "Agent tracks: 'Notify when fintech CTOs under 50 people tweet about hiring'",
  "Agent detects: 'Flag healthcare startups raising Series B without VP Marketing'",
  "Agent watches: 'Track pricing page changes at developer-tool companies'",
  "Agent scans: 'Monitor a16z portfolio companies posting AI/ML roles'",
];

const agenticFeatures = [
  {
    icon: Network,
    title: 'MCP Integration',
    description: 'Native Model Context Protocol support. Connect any MCP-compatible agent directly to Third Eye intelligence.',
  },
  {
    icon: Bot,
    title: 'Built-in AI Agents',
    description: 'Autonomous agents continuously monitor, validate, and enrich signals without manual intervention.',
  },
  {
    icon: Webhook,
    title: 'Agent-Friendly API',
    description: 'RESTful and tRPC endpoints designed for agent consumption. Real-time webhooks and streaming support.',
  },
  {
    icon: Brain,
    title: 'Agentic Orchestration',
    description: 'Multi-agent workflows that coordinate signal detection, validation, and enrichment automatically.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Agents Define Signals',
    description: 'Your AI agents create and configure custom signals through our API or MCP interface in natural language.',
  },
  {
    number: '02',
    title: 'Autonomous Monitoring',
    description: 'Our built-in agents continuously scan, validate, and enrich data across all sources in real-time.',
  },
  {
    number: '03',
    title: 'Agent Callbacks',
    description: 'Triggered signals flow directly to your agents via webhooks, MCP tools, or API polling for immediate action.',
  },
];

const apiExamples = [
  {
    id: 'faang-startup',
    title: 'FAANG → Startup transitions',
    description: 'Alert when Big Tech engineers join seed-stage companies',
    response: `{
  "movements": [
    {
      "id": "mov_abc123",
      "profileId": "prof_xyz789",
      "movement": "FAANG_TO_STARTUP",
      "linkedinUrl": "linkedin.com/in/alex-rivera",
      "metadata": {
        "previousRole": "Staff Engineer at Google",
        "previousCompanySize": 150000,
        "newRole": "Founding Engineer at VectorAI",
        "newCompanySize": 8,
        "fundingStage": "Seed ($2M)",
        "confidence": 0.97,
        "detectedAt": "2026-05-09T08:30:00Z",
        "signal": "High-caliber hire at early stage"
      }
    }
  ],
  "total": 1
}`
  },
  {
    id: 'exec-hire',
    title: 'First executive hire patterns',
    description: 'Detect when founders hire VP Sales/Marketing post-funding',
    response: `{
  "movements": [
    {
      "id": "mov_def456",
      "profileId": "prof_abc456",
      "movement": "FIRST_VP_HIRE",
      "linkedinUrl": "linkedin.com/in/marcus-chen",
      "metadata": {
        "newRole": "VP of Sales at ZenithAI",
        "companyAge": "18 months",
        "fundingStage": "Series A ($8M, 2 months ago)",
        "previouslyFounderLed": true,
        "confidence": 0.93,
        "detectedAt": "2026-05-09T09:15:00Z",
        "signal": "GTM expansion signal - ready to scale"
      }
    }
  ],
  "total": 1
}`
  },
  {
    id: 'competitor-poach',
    title: 'Competitor talent poaching',
    description: 'Track when your ICP hires from direct competitors',
    response: `{
  "movements": [
    {
      "id": "mov_ghi789",
      "profileId": "prof_def789",
      "movement": "COMPETITOR_HIRE",
      "linkedinUrl": "linkedin.com/in/priya-sharma",
      "metadata": {
        "previousRole": "Senior PM at Salesforce",
        "previousProduct": "Einstein AI Platform",
        "newRole": "Head of Product at RevenueOS",
        "competitorOverlap": ["Salesforce", "HubSpot"],
        "confidence": 0.91,
        "detectedAt": "2026-05-09T10:45:00Z",
        "signal": "ICP building competitive product"
      }
    }
  ],
  "total": 1
}`
  },
  {
    id: 'devrel-wave',
    title: 'Series B DevRel hiring wave',
    description: 'Detect when growth-stage companies build dev relations teams',
    response: `{
  "movements": [
    {
      "id": "mov_jkl012",
      "profileId": "prof_ghi012",
      "movement": "DEVREL_TEAM_BUILD",
      "linkedinUrl": "linkedin.com/in/jordan-williams",
      "metadata": {
        "newRole": "Head of Developer Relations at ApexDB",
        "isFirstDevRelHire": true,
        "companyStage": "Series B ($25M)",
        "developerToolCategory": "Database",
        "confidence": 0.89,
        "detectedAt": "2026-05-09T11:20:00Z",
        "signal": "Product-led growth initiative"
      }
    }
  ],
  "total": 1
}`
  },
  {
    id: 'founder-transition',
    title: 'Technical founder transitions',
    description: 'Monitor when CTOs move from operator to advisor role',
    response: `{
  "movements": [
    {
      "id": "mov_mno345",
      "profileId": "prof_jkl345",
      "movement": "FOUNDER_STEP_BACK",
      "linkedinUrl": "linkedin.com/in/nina-patel",
      "metadata": {
        "previousRole": "CTO & Co-Founder at StreamFlow",
        "newRole": "Technical Advisor at StreamFlow",
        "companyStage": "Series C ($50M)",
        "yearsAsOperator": 5,
        "confidence": 0.88,
        "detectedAt": "2026-05-09T12:00:00Z",
        "signal": "Maturity signal - scaling beyond founders"
      }
    }
  ],
  "total": 1
}`
  },
  {
    id: 'unicorn-acquisition',
    title: 'Post-acquisition talent retention',
    description: 'Track key employees staying or leaving after M&A',
    response: `{
  "movements": [
    {
      "id": "mov_pqr678",
      "profileId": "prof_mno678",
      "movement": "POST_ACQUISITION_EXIT",
      "linkedinUrl": "linkedin.com/in/james-wilson",
      "metadata": {
        "previousRole": "Head of Engineering at AcquiredCo",
        "newRole": "Stealth Startup (Founder)",
        "acquisitionDate": "2025-11-15",
        "daysAfterAcquisition": 175,
        "acquirer": "BigTech Corp ($500M)",
        "confidence": 0.94,
        "detectedAt": "2026-05-09T13:30:00Z",
        "signal": "Key talent exodus - potential acquihire failure"
      }
    }
  ],
  "total": 1
}`
  },
  {
    id: 'international-expansion',
    title: 'Geographic expansion hires',
    description: 'Detect first country managers for market entry',
    response: `{
  "movements": [
    {
      "id": "mov_stu901",
      "profileId": "prof_pqr901",
      "movement": "GEO_EXPANSION_HIRE",
      "linkedinUrl": "linkedin.com/in/sophie-mueller",
      "metadata": {
        "newRole": "Country Manager - Germany at CloudScale",
        "isFirstInternationalHire": true,
        "companyHQ": "San Francisco",
        "targetMarket": "EMEA",
        "companyStage": "Series B ($30M)",
        "confidence": 0.92,
        "detectedAt": "2026-05-09T14:15:00Z",
        "signal": "International growth signal"
      }
    }
  ],
  "total": 1
}`
  },
  {
    id: 'pivot-indicator',
    title: 'Product pivot indicators',
    description: 'Spot PM/Designer hires signaling product direction changes',
    response: `{
  "movements": [
    {
      "id": "mov_vwx234",
      "profileId": "prof_stu234",
      "movement": "SPECIALIST_HIRE_PIVOT",
      "linkedinUrl": "linkedin.com/in/raj-krishnan",
      "metadata": {
        "newRole": "Head of AI Products at AnalyticsPro",
        "previousDomain": "Traditional BI Tools",
        "newDomain": "AI-Powered Analytics",
        "companyPreviousFocus": "Business Intelligence",
        "hiringFromCompetitor": "OpenAI",
        "confidence": 0.90,
        "detectedAt": "2026-05-09T15:00:00Z",
        "signal": "Strategic pivot to AI - competitive threat"
      }
    }
  ],
  "total": 1
}`
  }
];

export default function Home() {
  const [selectedSignal, setSelectedSignal] = useState(apiExamples[0].id);
  const activeExample = apiExamples.find(ex => ex.id === selectedSignal) || apiExamples[0];

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-main/20 via-transparent to-purple-500/20 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-main/10 to-transparent animate-gradient-shift-reverse" />
      </div>

      {/* Animated Grid */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at center, transparent 0%, var(--background) 100%),
                           linear-gradient(var(--border) 1px, transparent 1px),
                           linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 50px 50px, 50px 50px',
          backgroundPosition: 'center, 0 0, 0 0',
        }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Third Eye Logo" width={40} height={40} />
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
      <section className="pt-32 pb-20 px-6 relative z-10">
        {/* Spotlight Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-main/20 rounded-full blur-3xl animate-spotlight" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-spotlight" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-5xl mx-auto relative">
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
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-main border-2 border-border shadow-shadow rounded-base animate-pulse-glow"
            >
              <Bot className="w-3.5 h-3.5 text-main-foreground" />
              <span className="text-xs font-heading text-main-foreground uppercase tracking-widest">
                Agent-Native GTM Intelligence
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-heading text-foreground mb-6 leading-none tracking-tight">
              GTM Intelligence
              <br />
              for <span className="text-main">AI Agents</span>
              <br />
            </h1>

            <p className="text-lg text-foreground/60 mb-10 max-w-xl font-base leading-relaxed">
              GTM intelligence that powers autonomous agents. Define signals in plain English, connect via MCP or API, and let AI track your market 24/7.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/api-docs">
                <Button size="lg">
                  Explore API Docs <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="neutral">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Example Signals Section */}
      <section className="py-20 px-6 border-t-2 border-border relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              What your agents
              <br />
              can do with Third Eye.
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
                className="glow-card bg-background border-2 border-border shadow-shadow rounded-base p-5 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-base bg-main/10 border-2 border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-main" />
                  </div>
                  <p className="text-foreground/80 font-base text-sm leading-relaxed">
                    {signal}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Demo Section */}
      <section className="py-20 px-6 border-t-2 border-border relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              Simple API,
              <br />
              <span className="text-main">Powerful Intelligence.</span>
            </h2>
            <p className="text-foreground/60 font-base">
              RESTful endpoints designed for agents. Get started in minutes.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Use Cases */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              {apiExamples.map((example) => (
                <div
                  key={example.id}
                  onClick={() => setSelectedSignal(example.id)}
                  className={`bg-background border-2 rounded-base p-4 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all cursor-pointer ${
                    selectedSignal === example.id
                      ? 'border-main bg-main/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-base border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedSignal === example.id
                        ? 'bg-main border-main'
                        : 'bg-main/10 border-border'
                    }`}>
                      <Check className={`w-3 h-3 ${
                        selectedSignal === example.id
                          ? 'text-main-foreground'
                          : 'text-main'
                      }`} />
                    </div>
                    <div>
                      <p className="text-foreground font-base font-semibold mb-1">{example.title}</p>
                      <p className="text-foreground/60 text-sm">{example.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Code Example */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[#1a1625] border-2 border-border rounded-base shadow-shadow overflow-hidden flex flex-col"
            >
              {/* Terminal Header */}
              <div className="bg-[#2a2137] border-b-2 border-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 border border-border" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 border border-border" />
                  <div className="w-3 h-3 rounded-full bg-green-500 border border-border" />
                </div>
                <span className="text-xs font-mono text-foreground/60 ml-2">Signal Tracking</span>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm overflow-x-auto flex-1">
                <div className="mb-6">
                  <p className="text-main font-bold mb-3">REQUEST</p>
                  <pre className="text-green-400 leading-relaxed">
{`curl https://api.thirdeye.ai/v1/people-lists/{listId}/movements \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  </pre>
                </div>

                <div>
                  <p className="text-main font-bold mb-3">RESPONSE</p>
                  <pre className="text-blue-300 leading-relaxed">
{activeExample.response}
                  </pre>
                </div>
              </div>

              {/* View Docs Link */}
              <div className="border-t-2 border-border bg-[#2a2137] px-6 py-4">
                <Link href="/api-docs" className="inline-flex items-center gap-2 text-main hover:text-main/80 transition-colors font-base text-sm">
                  <span>View full API documentation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Agentic Features Section */}
      <section className="py-20 px-6 border-t-2 border-border bg-secondary-background relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              Built for the
              <br />
              <span className="text-main">agentic era.</span>
            </h2>
            <p className="text-foreground/60 font-base">
              Connect any agent. Build autonomous workflows. Scale intelligently.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {agenticFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glow-card border-2 border-border rounded-base p-6 bg-background shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                >
                  <div className="w-12 h-12 rounded-base bg-main/10 border-2 border-border flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-main" />
                  </div>
                  <h3 className="text-xl font-heading text-foreground mb-2">{feature.title}</h3>
                  <p className="text-foreground/60 font-base text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t-2 border-border relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              Agent-to-Agent Workflow
            </h2>
            <p className="text-foreground/60 font-base">Fully autonomous signal intelligence</p>
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

      {/* Agent Integrations Section */}
      <section className="py-20 px-6 border-t-2 border-border relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              Works with your
              <br />
              <span className="text-main">agent stack.</span>
            </h2>
            <p className="text-foreground/60 font-base">
              Integrate with any agent framework or build custom workflows
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'MCP', subtitle: 'Model Context Protocol' },
              { name: 'LangChain', subtitle: 'Agent Framework' },
              { name: 'AutoGPT', subtitle: 'Autonomous Agents' },
              { name: 'CrewAI', subtitle: 'Multi-Agent Systems' },
              { name: 'Zapier', subtitle: 'Workflow Automation' },
              { name: 'n8n', subtitle: 'Agent Orchestration' },
              { name: 'Custom API', subtitle: 'Your Own Agents' },
              { name: 'Webhooks', subtitle: 'Real-time Events' },
            ].map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glow-card border-2 border-border rounded-base p-6 bg-background shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all text-center"
              >
                <div className="w-12 h-12 rounded-base bg-main/10 border-2 border-border flex items-center justify-center mx-auto mb-3">
                  <Code2 className="w-6 h-6 text-main" />
                </div>
                <h3 className="text-sm font-heading text-foreground mb-1">{integration.name}</h3>
                <p className="text-xs text-foreground/50 font-base">{integration.subtitle}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-main/10 border-2 border-border rounded-base animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-main" />
              <span className="text-sm font-base text-foreground">
                <strong className="font-heading">MCP Server Available:</strong> Install via npm or connect directly through Claude Code
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Book a Demo Section - Hidden for now */}
      {/* <section className="py-20 px-6 border-t-2 border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
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

              <Link href="https://calendly.com/thirdeye/demo" target="_blank" rel="noopener noreferrer">
                <Button size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Your Demo
                </Button>
              </Link>
            </div>

            <div>
              <div className="relative rounded-base border-4 border-border bg-secondary-background shadow-[8px_8px_0_0_var(--border)] overflow-hidden">
                <div className="aspect-[3/4] flex items-center justify-center p-8">
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
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-6 border-t-2 border-border bg-main relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-heading text-main-foreground mb-4">
              Ready to power your agents?
            </h2>
            <p className="text-main-foreground/70 font-base text-lg mb-8">
              {/* TODO: Confirm the real number before deploy */}
              Join 25+ teams building with agentic GTM intelligence.
            </p>

            <div className="flex flex-wrap gap-4 items-center mb-10">
              <Link href="/sign-in">
                <Button variant="neutral" size="lg">
                  Connect Your Agents <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-main-foreground/70 font-base">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-main-foreground" />
                <span>MCP-native</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-main-foreground" />
                <span>Agent-friendly API</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-main-foreground" />
                <span>Built-in automation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t-2 border-border bg-background relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Third Eye Logo" width={32} height={32} />
            <span className="text-sm font-heading text-foreground">Third Eye</span>
          </div>
          <p className="text-foreground/40 text-sm font-base">&copy; 2026 Third Eye. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
