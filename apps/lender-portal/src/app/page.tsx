import Link from 'next/link';
import {
  Building2,
  CheckCircle,
  Shield,
  Users,
  FileText,
  ArrowRight,
  Star,
  Zap,
  Lock,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Income Data',
    description:
      'Direct API integrations with Uber, Lyft, DoorDash, and 50+ gig platforms ensure accurate, tamper-proof income verification.',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Analytics',
    description:
      'Track income stability, growth trends, and diversification across multiple income sources with our proprietary scoring model.',
  },
  {
    icon: Zap,
    title: 'Instant Reports',
    description:
      'Get standardized, lender-ready income reports in seconds. No more waiting for manual verification processes.',
  },
  {
    icon: Users,
    title: 'Smart Matching',
    description:
      'AI-powered matching connects you with borrowers who meet your specific lending criteria and preferences.',
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    description:
      'SOC 2 Type II certified with end-to-end encryption. Your data and your borrowers\' data are always protected.',
  },
  {
    icon: FileText,
    title: 'Compliance Ready',
    description:
      'Reports designed to meet regulatory requirements for mortgage, auto, and personal lending decisions.',
  },
];

const stats = [
  { value: '50K+', label: 'Verified Borrowers' },
  { value: '$2.1B', label: 'Income Verified' },
  { value: '98%', label: 'Verification Accuracy' },
  { value: '500+', label: 'Lending Partners' },
];

const testimonials = [
  {
    quote:
      '1099Pass has transformed how we underwrite gig economy borrowers. The verified data gives us confidence to approve loans we would have previously declined.',
    author: 'Sarah Chen',
    role: 'VP of Lending',
    company: 'Pacific Credit Union',
  },
  {
    quote:
      'We\'ve reduced our verification time from weeks to minutes. The income scoring model is incredibly accurate and has improved our default rates.',
    author: 'Michael Rodriguez',
    role: 'Chief Risk Officer',
    company: 'Apex Mortgage',
  },
  {
    quote:
      'The ability to connect directly with pre-verified borrowers has been a game-changer for our loan origination team.',
    author: 'Jennifer Walsh',
    role: 'Director of Operations',
    company: 'First National Bank',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$99',
    period: '/month',
    features: [
      '100 report views/month',
      '25 borrower contacts/month',
      '1 team member',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/month',
    features: [
      '500 report views/month',
      '150 borrower contacts/month',
      '5 team members',
      'Advanced analytics',
      'Priority support',
      'Custom criteria',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited report views',
      'Unlimited contacts',
      'Unlimited team members',
      'API access',
      'Custom integrations',
      'Dedicated success manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">1099Pass</span>
            <span className="text-sm text-muted-foreground ml-2">for Lenders</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition">
              Testimonials
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-foreground hover:text-accent transition font-medium">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Trusted by 500+ lending institutions
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Verified Income Reports for{' '}
              <span className="text-accent">Gig Economy</span> Borrowers
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access standardized, lender-ready income verification for 1099 contractors
              and gig workers. Make confident lending decisions with verified data from
              50+ platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-accent text-white text-lg px-8 py-4 rounded-lg hover:bg-accent/90 transition font-medium"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center border border-border text-foreground text-lg px-8 py-4 rounded-lg hover:bg-muted transition font-medium"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-accent">{stat.value}</p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Lend Confidently
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools to verify, analyze, and connect
              with qualified gig economy borrowers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl border bg-card hover:shadow-lg transition"
                >
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and begin accessing verified borrower reports today.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Set Your Criteria
              </h3>
              <p className="text-muted-foreground">
                Define your lending preferences including income ranges, credit scores,
                and geographic areas.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Browse Matches
              </h3>
              <p className="text-muted-foreground">
                Review verified income reports from borrowers who match your criteria
                with our intuitive dashboard.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Connect & Close
              </h3>
              <p className="text-muted-foreground">
                Reach out to qualified borrowers directly through our secure messaging
                system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Leading Lenders
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our partners say about working with 1099Pass.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="p-6 rounded-xl border bg-card"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your lending volume. All plans include a 14-day
              free trial.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-xl border bg-card relative ${
                  plan.popular ? 'border-accent border-2 shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 px-6 rounded-lg font-medium transition ${
                    plan.popular
                      ? 'bg-accent text-white hover:bg-accent/90'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Gig Economy Lending?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join 500+ lending institutions who trust 1099Pass for verified income
            verification.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-white text-primary text-lg px-8 py-4 rounded-lg hover:bg-white/90 transition font-medium"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">1099Pass</span>
              </div>
              <p className="text-muted-foreground">
                The leading platform for verified gig economy income verification.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 1099Pass. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
