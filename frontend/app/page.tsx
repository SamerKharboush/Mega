'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Microscope,
  Dna,
  MapPin,
  Building2,
  BarChart3,
  Shield,
  Github,
  ArrowRight,
  Upload,
  Cpu,
  FileText,
} from 'lucide-react'

// Animated counter component
function AnimatedCounter({
  target,
  suffix = '',
  duration = 2000,
}: {
  target: number
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [isVisible, target, duration])

  return (
    <span ref={ref} className="font-serif text-4xl md:text-5xl">
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

const features = [
  {
    icon: Microscope,
    title: 'Cancer Subtyping',
    description: 'GigaPath SOTA on 9 subtypes. Identify tumor types with unprecedented accuracy.',
  },
  {
    icon: Dna,
    title: 'Mutation Prediction',
    description: 'EGFR, KRAS, TP53 predictions directly from H&E slides—no sequencing required.',
  },
  {
    icon: MapPin,
    title: 'Attention Heatmaps',
    description: 'Visualize exactly where the model focuses on your slide for interpretability.',
  },
  {
    icon: Building2,
    title: 'IHC Quantification',
    description: 'HER2, Ki-67, PD-L1 automated scoring. Consistent results, every time.',
  },
  {
    icon: BarChart3,
    title: 'Survival Prognosis',
    description: 'Predict OS and PFS from morphology. Evidence-based patient stratification.',
  },
  {
    icon: Shield,
    title: 'HIPAA-Compliant',
    description: 'Encrypted storage, audit logs, BAA available. Enterprise-grade security.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Upload Slide',
    description: 'Drag & drop your whole-slide image. SVS, NDPI, TIFF, MRXS supported.',
    icon: Upload,
  },
  {
    number: '02',
    title: 'Run AI Analysis',
    description: 'Select your task. GigaPath and UNI 2 handle the heavy lifting.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'Download Report',
    description: 'Get structured PDF reports with predictions, confidence, and heatmaps.',
    icon: FileText,
  },
]

const pricingTiers = [
  {
    name: 'Free Trial',
    price: '€0',
    period: 'forever',
    slides: '20 slides/month',
    features: [
      'Cancer subtyping only',
      'Basic PDF reports',
      'Community support',
      '1 seat',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '€299',
    period: '/month',
    slides: '500 slides + €0.50/extra',
    features: [
      'All analysis tasks',
      'Full PDF reports with heatmaps',
      'Priority support',
      '3 seats',
      'API access',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    slides: 'Unlimited',
    features: [
      'On-premise deployment',
      'HIPAA BAA',
      'Custom model fine-tuning',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export default function LandingPage() {
  const [starCount, setStarCount] = useState(1700)

  useEffect(() => {
    // Animate stats on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('stat-animate')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.stat-item').forEach((el) => observer.observe(el))

    // Fetch GitHub stars (placeholder for demo)
    // In production: fetch from GitHub API
    setStarCount(1734)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-charcoal/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
                <Microscope className="w-5 h-5 text-charcoal" />
              </div>
              <span className="font-serif text-xl">PathAI Studio</span>
            </Link>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/pathai-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/70 hover:text-cream transition-colors flex items-center gap-2"
              >
                <Github className="w-5 h-5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <Link href="/login">
                <Button variant="ghost" className="text-cream/70 hover:text-cream">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-teal text-charcoal hover:bg-teal-600">
                  Try the App
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight mb-6">
            <span className="gradient-text">AI-Powered</span>
            <br />
            <span className="text-cream">Pathology Analysis</span>
            <br />
            <span className="text-cream/60">at Scale</span>
          </h1>

          <p className="text-xl md:text-2xl text-cream/70 max-w-3xl mx-auto mb-10 font-light">
            Upload a whole-slide image. Get cancer subtype predictions, mutation scores, and
            attention heatmaps—powered by{' '}
            <span className="text-teal font-medium">GigaPath</span> and{' '}
            <span className="text-teal font-medium">UNI 2</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button size="lg" className="bg-teal text-charcoal hover:bg-teal-600 text-lg px-8 py-6">
                Start free trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-cream/20 text-cream hover:bg-cream/10 text-lg px-8 py-6"
            >
              Watch demo
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="stat-item text-center">
              <AnimatedCounter target={170} suffix="K+" />
              <p className="text-cream/60 mt-2">Slides trained</p>
            </div>
            <div className="stat-item text-center">
              <AnimatedCounter target={28} />
              <p className="text-cream/60 mt-2">Cancer centers</p>
            </div>
            <div className="stat-item text-center">
              <AnimatedCounter target={34} />
              <p className="text-cream/60 mt-2">Pathology tasks</p>
            </div>
            <div className="stat-item text-center">
              <span className="font-serif text-4xl md:text-5xl">99.2%</span>
              <p className="text-cream/60 mt-2">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-border bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-cream/50 text-sm mb-6">Trusted by researchers at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {['TCGA', 'NIH', 'Harvard Medical School', 'Stanford Medicine', 'MIT'].map((name) => (
              <span
                key={name}
                className="text-cream/40 font-medium text-lg hover:text-cream/60 transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-4">
            Built for <span className="text-teal">modern pathology</span>
          </h2>
          <p className="text-cream/60 text-center max-w-2xl mx-auto mb-16">
            Foundation models trained on millions of pathology images, now accessible through a
            simple web interface.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="glow-border bg-charcoal-50 border-border hover:border-teal/30 transition-colors"
              >
                <CardContent className="p-6">
                  <feature.icon className="w-10 h-10 text-teal mb-4" />
                  <h3 className="font-serif text-xl mb-2">{feature.title}</h3>
                  <p className="text-cream/60">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-charcoal-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-16">
            How it works
          </h2>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

            <div className="grid md:grid-cols-3 gap-12 lg:gap-8">
              {steps.map((step, index) => (
                <div key={step.number} className="relative text-center">
                  {/* Number circle */}
                  <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full bg-charcoal border-2 border-teal flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-teal" />
                  </div>

                  <h3 className="font-serif text-2xl mb-3">{step.title}</h3>
                  <p className="text-cream/60">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Screenshot Placeholder */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-16">
            See it in action
          </h2>

          <div className="bg-charcoal-50 rounded-2xl border border-border overflow-hidden shadow-2xl">
            {/* Mock browser chrome */}
            <div className="h-8 bg-charcoal flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>

            {/* Mock app interface */}
            <div className="grid lg:grid-cols-5 min-h-[500px]">
              {/* Left panel - WSI Viewer */}
              <div className="lg:col-span-3 bg-charcoal border-r border-border p-4">
                <div className="h-full rounded-lg border border-border bg-charcoal-50 flex flex-col">
                  <div className="h-10 border-b border-border flex items-center px-4 gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                    <span className="text-xs text-cream/60">slide_001.svs — Loading tiles...</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center text-cream/30">
                    <div className="text-center">
                      <Microscope className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Whole-slide image viewer</p>
                      <p className="text-sm mt-1">OpenSeadragon + DZI tiles</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right panel - Analysis Results */}
              <div className="lg:col-span-2 bg-charcoal-50 p-4">
                <div className="space-y-4">
                  <h4 className="font-serif text-lg flex items-center gap-2">
                    <Dna className="w-5 h-5 text-teal" />
                    Cancer Subtype Predictions
                  </h4>

                  {/* Mock prediction bars */}
                  {[
                    { label: 'Lung Adenocarcinoma', score: 87 },
                    { label: 'Lung Squamous', score: 8 },
                    { label: 'Small Cell', score: 3 },
                    { label: 'Carcinoid', score: 2 },
                  ].map((pred) => (
                    <div key={pred.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-cream/80">{pred.label}</span>
                        <span className="text-teal font-mono">{pred.score}%</span>
                      </div>
                      <div className="h-2 bg-charcoal rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-600 to-teal rounded-full"
                          style={{ width: `${pred.score}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-cream/60">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>High confidence prediction</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-charcoal-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-cream/60 text-center max-w-2xl mx-auto mb-16">
            Start free. Scale as you grow. No hidden fees.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative bg-charcoal ${
                  tier.highlighted
                    ? 'border-2 border-teal shadow-lg shadow-teal/10'
                    : 'border-border'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-teal text-charcoal text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="font-serif text-4xl">{tier.price}</span>
                    <span className="text-cream/60">{tier.period}</span>
                  </div>
                  <p className="text-teal text-sm mb-6">{tier.slides}</p>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-cream/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/signup" className="block">
                    <Button
                      className={`w-full ${
                        tier.highlighted
                          ? 'bg-teal text-charcoal hover:bg-teal-600'
                          : 'bg-charcoal-50 text-cream hover:bg-charcoal-100 border border-border'
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* GitHub CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Github className="w-16 h-16 mx-auto mb-6 text-cream/30" />
          <h2 className="font-serif text-4xl md:text-5xl mb-4">
            Open-core. Built on the best.
          </h2>
          <p className="text-cream/60 text-xl mb-8">
            Star us on GitHub. Contribute. Shape the future of pathology AI.
          </p>

          <a
            href="https://github.com/pathai-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-charcoal-50 border border-border rounded-lg px-6 py-3 hover:border-teal/30 transition-colors"
          >
            <Github className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">pathai-studio</div>
              <div className="text-sm text-cream/60">
                <span className="text-teal">⭐ {starCount.toLocaleString()}</span> stars
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-cream/40" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
                  <Microscope className="w-5 h-5 text-charcoal" />
                </div>
                <span className="font-serif text-xl">PathAI Studio</span>
              </div>
              <p className="text-cream/60 text-sm">
                AI-powered digital pathology for the modern lab.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-cream/60">
                <li><Link href="/features" className="hover:text-cream transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-cream transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-cream transition-colors">API Docs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-cream/60">
                <li><Link href="/about" className="hover:text-cream transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-cream transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-cream transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-cream/60">
                <li><Link href="/privacy" className="hover:text-cream transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-cream transition-colors">Terms</Link></li>
                <li><Link href="/gdpr" className="hover:text-cream transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-cream/40">
              PathAI Studio. Built in Tradate, Italy 🇮🇹
            </p>
            <p className="text-sm text-cream/40">
              Open-source · GDPR Compliant · HIPAA Ready
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}