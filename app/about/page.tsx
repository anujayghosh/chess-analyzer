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
            <div className="flex justify-center mb-6">
              <Image 
                src="/logo.svg" 
                alt="Chess Analyzer Logo" 
                width={100} 
                height={100} 
                className="h-24 w-24"
              />
            </div>
            <Badge className="mb-4" variant="outline">Powerful Analysis</Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">Chess Analyzer</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Elevate your chess game with professional-grade analysis, right in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link href="/">Try It Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg">
                <Link href="https://github.com/anujayghosh/chess-analyzer" target="_blank" rel="noopener noreferrer">View Source</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-white dark:bg-black relative overflow-hidden">
          <div className="absolute -right-20 -top-20 opacity-5">
            <span className="text-[400px]">♟️</span>
          </div>
          <div className="container mx-auto relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 z-10 relative">
                <Badge variant="secondary" className="mb-2">Cutting-Edge Technology</Badge>
                <h2 className="text-4xl font-bold tracking-tight">Powered by Stockfish</h2>
                <p className="text-xl text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-black/80 p-4 rounded-lg">
                  Analyze your games with one of the strongest chess engines in the world,
                  running directly in your browser.
                </p>
              </div>
              <div className="relative h-80 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl shadow-xl overflow-hidden">
                {/* Extra large chess piece icon */}
                <div className="absolute -bottom-10 -right-10 transform rotate-12">
                  <span className="text-[300px] text-blue-100 dark:text-blue-900">♜</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Feature */}
        <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
          <div className="absolute -left-20 -bottom-20 opacity-5">
            <span className="text-[400px]">♞</span>
          </div>
          <div className="container mx-auto relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative h-80 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl shadow-xl overflow-hidden">
                {/* Extra large lock icon */}
                <div className="absolute -top-10 -left-10 transform -rotate-12">
                  <span className="text-[300px] text-emerald-100 dark:text-emerald-900">🔒</span>
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6 z-10 relative">
                <Badge variant="secondary" className="mb-2">Your Data Stays With You</Badge>
                <h2 className="text-4xl font-bold tracking-tight">100% Private Analysis</h2>
                <p className="text-xl text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-950/80 p-4 rounded-lg">
                  All analysis occurs in your browser. Your game data is never stored on servers
                  or shared with third parties, ensuring complete privacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Source Section */}
        <section className="py-24 px-4 bg-white dark:bg-black relative overflow-hidden">
          <div className="absolute left-1/2 -top-40 transform -translate-x-1/2 opacity-5">
            <span className="text-[500px]">♝</span>
          </div>
          <div className="container mx-auto text-center relative">
            <Badge variant="outline" className="mb-4">Community-Driven</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-6">Open Source Project</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Created with passion and made available for everyone. Contribute, suggest improvements,
              or adapt it to your needs.
            </p>
            <div className="max-w-3xl mx-auto p-8 bg-slate-50 dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden relative">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl overflow-hidden">
                  <div className="absolute -left-5 -bottom-5 transform rotate-12">
                    <span className="text-[150px] text-slate-100 dark:text-slate-700">👨‍💻</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold">Created by Anujay Ghosh</h3>
                  <p className="text-slate-700 dark:text-slate-300 mt-2 mb-3">
                    A chess enthusiast and software engineer with expertise in full-stack development, 
                    machine learning, and interactive web applications. Passionate about creating tools 
                    that help people improve their lives.
                  </p>
                  <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
                    <a 
                      href="https://anujayghosh.github.io" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <span>Portfolio</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                    <a 
                      href="https://github.com/anujayghosh" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                      <span>GitHub</span>
                    </a>
                  </div>
                  <p className="mt-3 text-sm text-blue-600 dark:text-blue-400">
                    Looking to collaborate on open-source projects and innovative chess applications. 
                    Feel free to reach out!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
          <div className="absolute -right-40 -bottom-40 opacity-5">
            <span className="text-[600px]">♛</span>
          </div>
          <div className="container mx-auto relative">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Technical Details</Badge>
              <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-20">
                  <span className="text-[200px] text-blue-300 dark:text-blue-800">🧠</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Powerful Engine</h3>
                  <p className="text-slate-700 dark:text-slate-300 relative bg-white/70 dark:bg-slate-900/80 p-3 rounded-lg backdrop-blur-sm">
                    Uses the Stockfish chess engine via WebAssembly for lightning-fast analysis without server dependencies.
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute -left-20 -bottom-10 opacity-20">
                  <span className="text-[200px] text-blue-300 dark:text-blue-800">🎨</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Modern Interface</h3>
                  <p className="text-slate-700 dark:text-slate-300 relative bg-white/70 dark:bg-slate-900/80 p-3 rounded-lg backdrop-blur-sm">
                    Built with Next.js, React, and Tailwind CSS for a responsive and intuitive user experience on any device.
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute -right-16 -bottom-12 opacity-20">
                  <span className="text-[200px] text-blue-300 dark:text-blue-800">📊</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Detailed Insights</h3>
                  <p className="text-slate-700 dark:text-slate-300 relative bg-white/70 dark:bg-slate-900/80 p-3 rounded-lg backdrop-blur-sm">
                    Identifies best moves, mistakes, and blunders with visual board representation and player accuracy scores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 px-4 bg-gradient-to-b from-blue-500 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute -left-20 -top-40 opacity-10">
            <span className="text-[400px]">♔</span>
          </div>
          <div className="container mx-auto text-center relative">
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
          <p className="mt-2">© {new Date().getFullYear()} Chess Analyzer. Open source under the <a href="https://github.com/anujayghosh/chess-analyzer/blob/main/LICENSE" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">MIT License</a></p>
          <p className="mt-1 text-sm text-muted-foreground">
            Created with ❤️ by Anujay Ghosh · 
            <Link href="https://github.com/anujayghosh/chess-analyzer" className="ml-1 underline" target="_blank" rel="noopener noreferrer">GitHub</Link>
          </p>
        </div>
      </footer>
    </div>
  );
} 