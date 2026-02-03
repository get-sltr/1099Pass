import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-primary">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-white text-2xl font-bold">1099Pass</div>
        <div className="space-x-4">
          <Link href="/login" className="text-white hover:text-accent transition">
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold text-white mb-6">
            Verified Income Reports for Gig Workers
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Access standardized, lender-ready income verification reports for 1099
            contractors and gig economy workers. Make confident lending decisions with
            verified data.
          </p>
          <Link
            href="/register"
            className="inline-block bg-accent text-white text-lg px-8 py-4 rounded-lg hover:bg-accent-600 transition"
          >
            Start Free Trial
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-3">Verified Income</h3>
            <p className="text-gray-300">
              Direct integration with gig platforms ensures accurate income data.
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-3">Smart Matching</h3>
            <p className="text-gray-300">
              AI-powered matching connects you with borrowers meeting your criteria.
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-3">Compliant Reports</h3>
            <p className="text-gray-300">
              Standardized reports designed for mortgage and auto lending decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
