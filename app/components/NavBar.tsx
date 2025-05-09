'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Github, MenuIcon, ChevronRight, XIcon } from 'lucide-react';

interface NavBarProps {
  onNewAnalysis?: () => void;
  showNewAnalysis?: boolean;
}

export default function NavBar({ onNewAnalysis, showNewAnalysis = true }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Add shadow effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b bg-background/95 backdrop-blur transition-all ${scrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              {/* Chess Knight icon */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="h-7 w-7"
              >
                <path d="M10.62 5.44c-1-1-2.5-.8-3.5.2-.94.95-.92 2.5.02 3.44l.53.53-5.5 5.48c-.92.93-.9 2.47.02 3.4.96.96 2.46.94 3.43.03l5.47-5.47.52.52c.95.95 2.5.93 3.44-.02 1-1 1.2-2.5.2-3.5l-.2-.2C19.22 9.66 21 15 21 15c-2.2.02-5.54-1.34-7.07-2.87l-.2-.2c-1-1-2.5-.8-3.5.2-.94.95-.92 2.5.02 3.44l7.07 7.07a.3.3 0 01-.02.42.3.3 0 01-.42-.02L3.02 9.18a.3.3 0 01.02-.42.3.3 0 01.42.02l7.07 7.07c.94.94 2.5.96 3.44.02 1-1 1.2-2.5.2-3.5l-.2-.2c-1.53-1.53-2.87-4.87-2.86-7.07 0 0 5.4 1.8 5.4 1.8l-.2-.2c-1-1-2.5-.8-3.5.2-.94.95-.92 2.5.02 3.44l.52.52-5.47 5.47c-.9.92-2.44.94-3.4-.02-.94-1.13-.88-2.43.03-3.42l5.48-5.5.53.53c.94.94 2.5.96 3.44.02 1-1 1.2-2.5.2-3.5l-.2-.2z"/>
              </svg>
              <span className="font-bold text-xl">Chess Analyzer</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="/" className="relative transition-colors hover:text-primary py-2">
              Home
              <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </Link>
            <Link href="/about" className="relative transition-colors hover:text-primary py-2">
              About
              <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </Link>
            <a 
              href="https://github.com/yourusername/chess-analysis" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-colors hover:text-primary flex items-center gap-1"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {showNewAnalysis && (
              <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-md"
                onClick={onNewAnalysis}>
                <span>New Analysis</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            
            <button
              className="md:hidden p-1 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="border-b md:hidden">
          <div className="container flex flex-col space-y-4 py-4 px-4 sm:px-6">
            <Link 
              href="/" 
              className="text-sm font-medium transition-colors hover:text-primary flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium transition-colors hover:text-primary flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              About
            </Link>
            <a 
              href="https://github.com/yourusername/chess-analysis" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <Github size={16} className="mr-1" />
              <span>GitHub</span>
            </a>
            {showNewAnalysis && (
              <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white w-full"
                onClick={() => {
                  if (onNewAnalysis) {
                    onNewAnalysis();
                    setIsMenuOpen(false);
                  }
                }}>
                New Analysis
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 