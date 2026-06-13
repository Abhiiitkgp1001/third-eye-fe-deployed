'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Bot,
  Network,
  Code2,
  Brain,
  Webhook,
  Sparkles,
  Terminal,
  Plug,
  Radio,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type ApiExample = {
  id: string;
  signal: string;
  title: string;
  description: string;
  response: string;
};

const apiExamples: ApiExample[] = [
  {
    id: 'faang-startup',
    signal: 'FAANG_TO_STARTUP',
    title: 'FAANG → Startup transitions',
    description: 'Alert when Big Tech engineers join seed-stage companies',
    response: `{
  "movements": [
    {
      "id": "mov_abc123",
      "movement": "FAANG_TO_STARTUP",
      "linkedinUrl": "linkedin.com/in/alex-rivera",
      "metadata": {
        "previousRole": "Staff Engineer at Google",
        "newRole": "Founding Engineer at VectorAI",
        "newCompanySize": 8,
        "fundingStage": "Seed ($2M)",
        "confidence": 0.97
      }
    }
  ],
  "total": 1
}`,
  },
  {
    id: 'exec-hire',
    signal: 'FIRST_VP_HIRE',
    title: 'First executive hire patterns',
    description: 'Detect when founders hire VP Sales/Marketing post-funding',
    response: `{
  "movements": [
    {
      "id": "mov_def456",
      "movement": "FIRST_VP_HIRE",
      "linkedinUrl": "linkedin.com/in/marcus-chen",
      "metadata": {
        "newRole": "VP of Sales at ZenithAI",
        "companyAge": "18 months",
        "fundingStage": "Series A ($8M)",
        "previouslyFounderLed": true,
        "confidence": 0.93
      }
    }
  ],
  "total": 1
}`,
  },
  {
    id: 'competitor-poach',
    signal: 'COMPETITOR_HIRE',
    title: 'Competitor talent poaching',
    description: 'Track when your ICP hires from direct competitors',
    response: `{
  "movements": [
    {
      "id": "mov_ghi789",
      "movement": "COMPETITOR_HIRE",
      "linkedinUrl": "linkedin.com/in/priya-sharma",
      "metadata": {
        "previousRole": "Senior PM at Salesforce",
        "newRole": "Head of Product at RevenueOS",
        "competitorOverlap": ["Salesforce", "HubSpot"],
        "confidence": 0.91
      }
    }
  ],
  "total": 1
}`,
  },
  {
    id: 'devrel-wave',
    signal: 'DEVREL_TEAM_BUILD',
    title: 'Series B DevRel hiring wave',
    description: 'Detect growth-stage companies building dev relations teams',
    response: `{
  "movements": [
    {
      "id": "mov_jkl012",
      "movement": "DEVREL_TEAM_BUILD",
      "linkedinUrl": "linkedin.com/in/jordan-williams",
      "metadata": {
        "newRole": "Head of Developer Relations at ApexDB",
        "isFirstDevRelHire": true,
        "companyStage": "Series B ($25M)",
        "confidence": 0.89
      }
    }
  ],
  "total": 1
}`,
  },
  {
    id: 'founder-transition',
    signal: 'FOUNDER_STEP_BACK',
    title: 'Technical founder transitions',
    description: 'Monitor when CTOs move from operator to advisor role',
    response: `{
  "movements": [
    {
      "id": "mov_mno345",
      "movement": "FOUNDER_STEP_BACK",
      "linkedinUrl": "linkedin.com/in/nina-patel",
      "metadata": {
        "previousRole": "CTO & Co-Founder at StreamFlow",
        "newRole": "Technical Advisor at StreamFlow",
        "companyStage": "Series C ($50M)",
        "confidence": 0.88
      }
    }
  ],
  "total": 1
}`,
  },
  {
    id: 'unicorn-acquisition',
    signal: 'POST_ACQUISITION_EXIT',
    title: 'Post-acquisition talent retention',
    description: 'Track key employees staying or leaving after M&A',
    response: `{
  "movements": [
    {
      "id": "mov_pqr678",
      "movement": "POST_ACQUISITION_EXIT",
      "linkedinUrl": "linkedin.com/in/james-wilson",
      "metadata": {
        "previousRole": "Head of Engineering at AcquiredCo",
        "newRole": "Stealth Startup (Founder)",
        "daysAfterAcquisition": 175,
        "confidence": 0.94
      }
    }
  ],
  "total": 1
}`,
  },
  {
    id: 'international-expansion',
    signal: 'GEO_EXPANSION_HIRE',
    title: 'Geographic expansion hires',
    description: 'Detect first country managers for market entry',
    response: `{
  "movements": [
    {
      "id": "mov_stu901",
      "movement": "GEO_EXPANSION_HIRE",
      "linkedinUrl": "linkedin.com/in/sophie-mueller",
      "metadata": {
        "newRole": "Country Manager - Germany at CloudScale",
        "isFirstInternationalHire": true,
        "targetMarket": "EMEA",
        "confidence": 0.92
      }
    }
  ],
  "total": 1
}`,
  },
  {
    id: 'pivot-indicator',
    signal: 'SPECIALIST_HIRE_PIVOT',
    title: 'Product pivot indicators',
    description: 'Spot specialist hires signaling product direction changes',
    response: `{
  "movements": [
    {
      "id": "mov_vwx234",
      "movement": "SPECIALIST_HIRE_PIVOT",
      "linkedinUrl": "linkedin.com/in/raj-krishnan",
      "metadata": {
        "newRole": "Head of AI Products at AnalyticsPro",
        "previousDomain": "Traditional BI Tools",
        "hiringFromCompetitor": "OpenAI",
        "confidence": 0.90
      }
    }
  ],
  "total": 1
}`,
  },
];

const exampleSignals = [
  "Find companies that just raised Series A and need a Head of Sales",
  "Alert when any YC company posts their first design role",
  "Notify when fintech CTOs under 50 people start hiring",
  "Flag healthcare startups raising Series B without a VP Marketing",
  "Watch for engineers leaving a16z portfolio companies",
  "Track when our champions change jobs to a new account",
];

const capabilities = [
  {
    icon: Network,
    title: 'MCP-native',
    description:
      'Expose every signal as a Model Context Protocol tool. Any MCP-compatible agent connects in one line — no glue code.',
  },
  {
    icon: Webhook,
    title: 'Streaming webhooks',
    description:
      'The moment a signal fires, we push the movement to your agent. Real-time, signed, and retried until delivered.',
  },
  {
    icon: Code2,
    title: 'Structured movements',
    description:
      'Every signal returns typed JSON with confidence scores and evidence — built to be parsed by a model, not a human.',
  },
  {
    icon: Brain,
    title: 'Plain-English signals',
    description:
      'Define what to watch for in natural language. Your agent creates and tunes its own signals through the API.',
  },
];

const pipeline = [
  {
    icon: Plug,
    number: '01',
    title: 'Agents define signals',
    description:
      'Your agent describes what to track in plain English via the API or an MCP tool call.',
  },
  {
    icon: Radio,
    number: '02',
    title: 'Third Eye monitors 24/7',
    description:
      'We continuously scan, enrich, and validate the market so your agent never has to poll.',
  },
  {
    icon: Webhook,
    number: '03',
    title: 'Movements fire back',
    description:
      'Validated signals stream to your agent via webhook, MCP, or API — ready to act on instantly.',
  },
];

const integrations = [
  { name: 'MCP', subtitle: 'Model Context Protocol' },
  { name: 'Claude', subtitle: 'Anthropic Agents' },
  { name: 'Cursor', subtitle: 'Agentic IDE' },
  { name: 'LangChain', subtitle: 'Agent Framework' },
  { name: 'CrewAI', subtitle: 'Multi-Agent Systems' },
  { name: 'AutoGPT', subtitle: 'Autonomous Agents' },
  { name: 'n8n', subtitle: 'Agent Orchestration' },
  { name: 'Webhooks', subtitle: 'Real-time Events' },
];

const trustStack = [
  'MCP',
  'Claude',
  'Cursor',
  'LangChain',
  'CrewAI',
  'AutoGPT',
  'n8n',
  'Zapier',
  'Custom Agents',
];

// ---------------------------------------------------------------------------
// Streaming code helpers
// ---------------------------------------------------------------------------

/** Reveals `text` character-by-character, restarting whenever `resetKey` changes. */
function useStream(text: string, resetKey: string): string {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    setTyped('');
    let i = 0;
    const step = Math.max(3, Math.floor(text.length / 90));
    const id = setInterval(() => {
      i += step;
      if (i >= text.length) {
        setTyped(text);
        clearInterval(id);
      } else {
        setTyped(text.slice(0, i));
      }
    }, 18);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return typed;
}

function TerminalChrome({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1a1625] border-2 border-border rounded-base shadow-shadow overflow-hidden flex flex-col">
      <div className="bg-[#2a2137] border-b-2 border-border px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500 border border-border" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 border border-border" />
          <div className="w-3 h-3 rounded-full bg-green-500 border border-border" />
        </div>
        <span className="text-xs font-mono text-white/50 ml-2 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Auto-cycling hero terminal — streams each signal then advances. */
function HeroTerminal() {
  const [index, setIndex] = useState(0);
  const example = apiExamples[index];
  const request = `curl https://api.thirdeye.ai/v1/movements?signal=${example.signal} \\
  -H "Authorization: Bearer $THIRDEYE_API_KEY"`;
  const typed = useStream(example.response, `hero-${index}`);
  const done = typed.length >= example.response.length;

  useEffect(() => {
    const t = setTimeout(
      () => setIndex((p) => (p + 1) % apiExamples.length),
      5200,
    );
    return () => clearTimeout(t);
  }, [index]);

  return (
    <TerminalChrome label="agent → Third Eye">
      <div className="p-5 font-mono text-[13px] leading-relaxed overflow-x-auto min-h-[340px]">
        <p className="text-main font-bold mb-2">$ REQUEST</p>
        <pre className="text-green-400 whitespace-pre-wrap mb-5">{request}</pre>
        <p className="text-main font-bold mb-2 flex items-center gap-2">
          ↳ RESPONSE
          {done && (
            <span className="text-[10px] font-base px-1.5 py-0.5 rounded-base bg-green-500/15 text-green-400 border border-green-500/30">
              200 OK
            </span>
          )}
        </p>
        <pre className="text-blue-300 whitespace-pre-wrap">
          {typed}
          {!done && <span className="text-main animate-blink">▍</span>}
        </pre>
      </div>
    </TerminalChrome>
  );
}

type PlaygroundTab = 'curl' | 'mcp' | 'webhook';

function requestFor(ex: ApiExample, tab: PlaygroundTab): string {
  if (tab === 'curl') {
    return `curl https://api.thirdeye.ai/v1/movements?signal=${ex.signal} \\
  -H "Authorization: Bearer $THIRDEYE_API_KEY"`;
  }
  if (tab === 'mcp') {
    return `// Agent invokes Third Eye via MCP
{
  "tool": "thirdeye_query_movements",
  "arguments": {
    "signal": "${ex.signal}",
    "listId": "list_9f2a"
  }
}`;
  }
  return `POST https://your-agent.dev/hooks/thirdeye
x-thirdeye-signature: t=1715,v1=a3f9...

// Third Eye pushes the movement the instant it fires`;
}

function PlaygroundTerminal({
  example,
  tab,
}: {
  example: ApiExample;
  tab: PlaygroundTab;
}) {
  const request = requestFor(example, tab);
  const typed = useStream(example.response, `${example.id}-${tab}`);
  const done = typed.length >= example.response.length;
  const responseLabel = tab === 'webhook' ? '↳ PAYLOAD' : '↳ RESPONSE';

  return (
    <div className="p-6 font-mono text-sm overflow-x-auto flex-1 min-h-[380px]">
      <div className="mb-6">
        <p className="text-main font-bold mb-3">
          {tab === 'webhook' ? 'DELIVERY' : 'REQUEST'}
        </p>
        <pre className="text-green-400 leading-relaxed whitespace-pre-wrap">
          {request}
        </pre>
      </div>
      <div>
        <p className="text-main font-bold mb-3 flex items-center gap-2">
          {responseLabel}
          {done && (
            <span className="text-[10px] font-base px-1.5 py-0.5 rounded-base bg-green-500/15 text-green-400 border border-green-500/30">
              {tab === 'webhook' ? 'DELIVERED' : '200 OK'}
            </span>
          )}
        </p>
        <pre className="text-blue-300 leading-relaxed whitespace-pre-wrap">
          {typed}
          {!done && <span className="text-main animate-blink">▍</span>}
        </pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  const [selectedSignal, setSelectedSignal] = useState(apiExamples[0].id);
  const [tab, setTab] = useState<PlaygroundTab>('curl');
  const activeExample =
    apiExamples.find((ex) => ex.id === selectedSignal) || apiExamples[0];

  const tabs: { id: PlaygroundTab; label: string }[] = [
    { id: 'curl', label: 'REST' },
    { id: 'mcp', label: 'MCP' },
    { id: 'webhook', label: 'Webhook' },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-main/20 via-transparent to-purple-500/20 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-main/10 to-transparent animate-gradient-shift-reverse" />
      </div>

      {/* Animated Grid */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at center, transparent 0%, var(--background) 100%),
                           linear-gradient(var(--border) 1px, transparent 1px),
                           linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 50px 50px, 50px 50px',
            backgroundPosition: 'center, 0 0, 0 0',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Third Eye Logo" width={40} height={40} />
            <span className="text-lg font-heading text-foreground">Third Eye</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/api-docs" className="hidden sm:block">
              <Button variant="neutral" size="sm">
                API Docs
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="noShadow" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative z-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-main/20 rounded-full blur-3xl animate-spotlight" />
          <div
            className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-spotlight"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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

            <h1 className="text-5xl md:text-7xl font-heading text-foreground mb-6 leading-[0.95] tracking-tight">
              GTM intelligence
              <br />
              your <span className="text-main">agents</span> call
              <br />
              directly.
            </h1>

            <p className="text-lg text-foreground/60 mb-8 max-w-xl font-base leading-relaxed">
              Define a buying signal in plain English. Third Eye watches the
              market 24/7 and streams structured movements straight to your
              agents — over REST, MCP, or webhooks.
            </p>

            <div className="flex flex-wrap gap-4 items-center mb-8">
              <Link href="/api-docs">
                <Button size="lg">
                  Explore the API <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="neutral">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/50 font-base">
              {['MCP-native', 'REST + tRPC', 'Real-time webhooks'].map((f) => (
                <span key={f} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-main" />
                  {f}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: streaming terminal */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="animate-float-soft"
          >
            <HeroTerminal />
          </motion.div>
        </div>
      </section>

      {/* Trust marquee */}
      <section className="py-8 border-y-2 border-border relative z-10 bg-secondary-background/50">
        <p className="text-center text-xs font-heading uppercase tracking-widest text-foreground/40 mb-6">
          Drops into any agent stack
        </p>
        <div className="marquee-mask overflow-hidden">
          <div className="flex w-max animate-marquee gap-4">
            {[...trustStack, ...trustStack].map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-5 py-2.5 bg-background border-2 border-border rounded-base shadow-shadow shrink-0"
              >
                <Code2 className="w-4 h-4 text-main" />
                <span className="text-sm font-heading text-foreground whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive API Playground */}
      <section className="py-20 px-6 border-b-2 border-border relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              One API.
              <br />
              <span className="text-main">Three ways to talk to it.</span>
            </h2>
            <p className="text-foreground/60 font-base">
              Pick a signal. Watch your agent get the same structured movement
              over REST, MCP, or a webhook.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Use cases */}
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
                    <div
                      className={`w-6 h-6 rounded-base border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedSignal === example.id
                          ? 'bg-main border-main'
                          : 'bg-main/10 border-border'
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          selectedSignal === example.id
                            ? 'text-main-foreground'
                            : 'text-main'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-foreground font-base font-semibold mb-1">
                        {example.title}
                      </p>
                      <p className="text-foreground/60 text-sm">
                        {example.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Terminal + tabs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <TerminalChrome label={`signal: ${activeExample.signal}`}>
                {/* tab bar */}
                <div className="flex border-b-2 border-border bg-[#221a2e]">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`px-4 py-2.5 text-xs font-heading uppercase tracking-wide transition-colors border-r-2 border-border ${
                        tab === t.id
                          ? 'bg-main text-main-foreground'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <PlaygroundTerminal example={activeExample} tab={tab} />
                <div className="border-t-2 border-border bg-[#2a2137] px-6 py-4">
                  <Link
                    href="/api-docs"
                    className="inline-flex items-center gap-2 text-main hover:text-main/80 transition-colors font-base text-sm"
                  >
                    <span>Read the full API reference</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </TerminalChrome>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Example signals */}
      <section className="py-20 px-6 border-b-2 border-border relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              Describe the signal.
              <br />
              <span className="text-main">We handle the rest.</span>
            </h2>
            <p className="text-foreground/60 font-base">
              No filters, no firehose. Just tell your agent what matters.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {exampleSignals.map((signal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="glow-card bg-background border-2 border-border shadow-shadow rounded-base p-5 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-base bg-main/10 border-2 border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-main" />
                  </div>
                  <p className="text-foreground/80 font-base text-sm leading-relaxed">
                    &ldquo;{signal}&rdquo;
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent-to-agent pipeline */}
      <section className="py-20 px-6 border-b-2 border-border bg-secondary-background relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              Drop Third Eye into
              <br />
              <span className="text-main">any agent loop.</span>
            </h2>
            <p className="text-foreground/60 font-base">
              Fully autonomous, agent-to-agent signal intelligence.
            </p>
          </motion.div>

          <div className="relative">
            {/* animated connector line (desktop) */}
            <svg
              className="hidden md:block absolute top-12 left-0 w-full h-2 z-0"
              preserveAspectRatio="none"
              viewBox="0 0 100 2"
            >
              <line
                x1="0"
                y1="1"
                x2="100"
                y2="1"
                stroke="var(--main)"
                strokeWidth="0.5"
                className="animate-flow-line"
                opacity="0.5"
              />
            </svg>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {pipeline.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.15 }}
                    className="border-2 border-border rounded-base p-6 bg-background shadow-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-base bg-main border-2 border-border flex items-center justify-center animate-pulse-glow">
                        <Icon className="w-6 h-6 text-main-foreground" />
                      </div>
                      <span className="text-4xl font-heading text-main/30 leading-none">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg font-heading text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-foreground/60 font-base text-sm">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 px-6 border-b-2 border-border relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-3">
              Built for machines
              <br />
              <span className="text-main">to consume.</span>
            </h2>
            <p className="text-foreground/60 font-base">
              Every design choice assumes the reader is an agent, not a human.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {capabilities.map((feature, index) => {
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
                  <h3 className="text-xl font-heading text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60 font-base text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-6 border-b-2 border-border relative z-10">
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
              Connect any framework, or wire up your own agents in minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
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
                <h3 className="text-sm font-heading text-foreground mb-1">
                  {integration.name}
                </h3>
                <p className="text-xs text-foreground/50 font-base">
                  {integration.subtitle}
                </p>
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
                <strong className="font-heading">MCP Server:</strong> connect
                directly through Claude, Cursor, or any MCP client
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-b-2 border-border bg-main relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-heading text-main-foreground mb-4">
              Give your agents eyes
              <br />
              on the market.
            </h2>
            <p className="text-main-foreground/70 font-base text-lg mb-8">
              Join the teams building autonomous GTM with agent-native
              intelligence.
            </p>

            <div className="flex flex-wrap gap-4 items-center mb-10">
              <Link href="/api-docs">
                <Button variant="neutral" size="lg">
                  Explore the API <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="noShadow" size="lg">
                  Connect Your Agents <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-main-foreground/70 font-base">
              {['MCP-native', 'Agent-friendly API', 'Real-time webhooks'].map(
                (f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-main-foreground" />
                    <span>{f}</span>
                  </div>
                ),
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t-2 border-border bg-background relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Third Eye Logo" width={32} height={32} />
            <span className="text-sm font-heading text-foreground">
              Third Eye
            </span>
          </div>
          <p className="text-foreground/40 text-sm font-base">
            &copy; 2026 Third Eye. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
