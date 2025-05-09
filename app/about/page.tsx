import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import NavBar from '../components/NavBar';
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <div className="container mx-auto text-center">
            <Badge className="mb-4" variant="outline">Powerful Analysis</Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">Chess Game Analyzer</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Elevate your chess game with professional-grade analysis, right in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link href="/">Try It Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg">
                <Link href="https://github.com/yourusername/chess-analysis" target="_blank" rel="noopener noreferrer">View Source</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-white dark:bg-black">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="mb-2">Cutting-Edge Technology</Badge>
                <h2 className="text-4xl font-bold tracking-tight">Powered by Stockfish</h2>
                <p className="text-xl text-muted-foreground">
                  Analyze your games with one of the strongest chess engines in the world,
                  running directly in your browser.
                </p>
              </div>
              <div className="relative h-80 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl shadow-xl overflow-hidden">
                {/* Placeholder for chess board visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">♟️</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Feature */}
        <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative h-80 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl shadow-xl overflow-hidden">
                {/* Placeholder for privacy illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">🔒</span>
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <Badge variant="secondary" className="mb-2">Your Data Stays With You</Badge>
                <h2 className="text-4xl font-bold tracking-tight">100% Private Analysis</h2>
                <p className="text-xl text-muted-foreground">
                  All analysis occurs in your browser. Your game data is never stored on servers
                  or shared with third parties, ensuring complete privacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Source Section */}
        <section className="py-24 px-4 bg-white dark:bg-black">
          <div className="container mx-auto text-center">
            <Badge variant="outline" className="mb-4">Community-Driven</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-6">Open Source Project</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Created with passion and made available for everyone. Contribute, suggest improvements,
              or adapt it to your needs.
            </p>
            <div className="max-w-3xl mx-auto p-8 bg-slate-50 dark:bg-slate-900 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl">
                  👨‍💻
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold">Created by Anujay Ghosh</h3>
                  <p className="text-muted-foreground mt-2">
                    A chess enthusiast and developer passionate about creating tools that help players improve their game.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Technical Details</Badge>
              <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl mb-6">
                  🧠
                </div>
                <h3 className="text-xl font-bold mb-4">Powerful Engine</h3>
                <p className="text-muted-foreground">
                  Uses the Stockfish chess engine via WebAssembly for lightning-fast analysis without server dependencies.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl mb-6">
                  🎨
                </div>
                <h3 className="text-xl font-bold mb-4">Modern Interface</h3>
                <p className="text-muted-foreground">
                  Built with Next.js, React, and Tailwind CSS for a responsive and intuitive user experience on any device.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl mb-6">
                  📊
                </div>
                <h3 className="text-xl font-bold mb-4">Detailed Insights</h3>
                <p className="text-muted-foreground">
                  Identifies best moves, mistakes, and blunders with visual board representation and player accuracy scores.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 px-4 bg-gradient-to-b from-blue-500 to-indigo-600 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to improve your chess game?</h2>
            <p className="text-xl max-w-3xl mx-auto mb-10 opacity-90">
              Start analyzing your games today with professional-grade tools, completely free and private.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg">
              <Link href="/">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="py-10 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Powered by Stockfish and Next.js</p>
          <p className="mt-2">© {new Date().getFullYear()} Chess Game Analyzer. All rights reserved.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Created with ❤️ by Anujay Ghosh · 
            <Link href="https://github.com/yourusername/chess-analysis" className="ml-1 underline" target="_blank" rel="noopener noreferrer">GitHub</Link>
          </p>
        </div>
      </footer>
    </div>
  );
} 