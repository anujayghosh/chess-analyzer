'use client';

import { useState, useEffect, useRef } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import PgnUploader from './PgnUploader';
import ChessboardDisplay, { ChessboardDisplayHandle } from './ChessboardDisplay';
import AnalysisDisplay from './AnalysisDisplay';
import GameSummary from './GameSummary';
import NavBar from './NavBar';
import { useStockfish } from '../hooks/useStockfish';
import { AnalyzedMove, StockfishLevel } from '../lib/stockfish/stockfish-service';
import stockfishService from '../lib/stockfish/stockfish-service';
import { Card, CardContent } from '@/components/ui/card';

export default function AnalysisPage() {
  const [pgn, setPgn] = useState<string>('');
  const [analyzedMoves, setAnalyzedMoves] = useState<AnalyzedMove[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [skillLevel, setSkillLevel] = useState<StockfishLevel>(20);
  const [showingUploader, setShowingUploader] = useState(true);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Map<StockfishLevel, AnalyzedMove[]>>(new Map());
  const [backgroundAnalysisProgress, setBackgroundAnalysisProgress] = useState<number>(0);
  const [isPerformingBackgroundAnalysis, setIsPerformingBackgroundAnalysis] = useState<boolean>(false);
  
  // New state for arrow visualization
  const [selectedMoveType, setSelectedMoveType] = useState<'played' | 'best' | 'alternative'>('played');
  const [selectedAlternativeIndex, setSelectedAlternativeIndex] = useState<number | undefined>(undefined);
  
  // Refs to access methods from child components - use proper typing
  const chessboardRef = useRef<ChessboardDisplayHandle>(null);
  
  const {
    isInitialized,
    isAnalyzing,
    progress,
    analyzeGame,
    setSkillLevel: setStockfishSkillLevel
  } = useStockfish();
  
  // Check if Stockfish is available
  useEffect(() => {
    const checkStockfish = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Check if Stockfish is already initialized
          if (stockfishService.isInitialized) {
            return; // Already initialized, no need to show error
          }
          
          // Wait 2 seconds for initialization
          setTimeout(() => {
            if (!isInitialized && !stockfishService.isInitialized) {
              setEngineError('Failed to initialize Stockfish. Please try reloading the page.');
            }
          }, 2000);
        } catch (error) {
          setEngineError('Failed to initialize Stockfish. Please try reloading the page.');
        }
      }
    };
    
    checkStockfish();
  }, [isInitialized]);
  
  const handlePgnSubmit = async (inputPgn: string, initialEngineLevel: StockfishLevel = 20) => {
    if (engineError) {
      toast.error('Stockfish engine is not available. Please try reloading the page.');
      return;
    }
    
    if (isAnalyzing) {
      toast.error('Analysis already in progress');
      return;
    }
    
    if (!inputPgn.trim()) {
      toast.error('Please upload or paste a valid PGN');
      return;
    }
    
    setPgn(inputPgn);
    setShowingUploader(false);
    setAnalysisCache(new Map()); // Clear any cached analyses
    
    // Update the skill level based on user selection
    setSkillLevel(initialEngineLevel);
    setStockfishSkillLevel(initialEngineLevel);
    
    toast.info(`Starting Stockfish analysis with engine level ${initialEngineLevel}...`);
    
    try {
      // Analyze with initial skill level selected by user
      const result = await analyzeGame(
        inputPgn,
        initialEngineLevel,
        15,
        (progress) => {
          if (progress % 10 === 0) {
            toast.info(`Analysis progress: ${progress}%`);
          }
        }
      );
      
      if (result.length === 0) {
        toast.error('Analysis failed or no moves were found. Please try again with a different PGN.');
        setShowingUploader(true);
        return;
      }
      
      // Store initial analysis in cache
      const newCache = new Map<StockfishLevel, AnalyzedMove[]>();
      newCache.set(initialEngineLevel, result);
      setAnalysisCache(newCache);
      
      setAnalyzedMoves(result);
      // Set to first move by default
      setCurrentMoveIndex(0);
      toast.success('Analysis complete!');
      
      // Start background analysis for other skill levels
      performBackgroundAnalysis(inputPgn, newCache);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
      setShowingUploader(true);
    }
  };
  
  // Function to perform background analysis for all skill levels
  const performBackgroundAnalysis = async (inputPgn: string, initialCache: Map<StockfishLevel, AnalyzedMove[]>) => {
    if (!inputPgn || isPerformingBackgroundAnalysis) return;
    
    setIsPerformingBackgroundAnalysis(true);
    setBackgroundAnalysisProgress(0);
    
    const allLevels: StockfishLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const remainingLevels = allLevels.filter(level => !initialCache.has(level));
    const newCache = new Map(initialCache);
    
    // Only show this once
    toast.info('Analyzing additional engine strengths in the background...', {
      duration: 3000,
      id: 'background-analysis'
    });
    
    try {
      for (let i = 0; i < remainingLevels.length; i++) {
        const level = remainingLevels[i];
        
        // Don't run analysis if user has navigated away
        if (showingUploader) {
          break;
        }
        
        // Update stockfish skill level
        setStockfishSkillLevel(level);
        
        // Run analysis
        const result = await analyzeGame(
          inputPgn,
          level,
          15,
          () => {} // Silent progress tracking
        );
        
        // Store in cache if valid
        if (result.length > 0) {
          newCache.set(level, result);
          setAnalysisCache(new Map(newCache));
        }
        
        // Update progress
        const progress = Math.round(((i + 1) / remainingLevels.length) * 100);
        setBackgroundAnalysisProgress(progress);
      }
    } catch (error) {
      console.error('Background analysis error:', error);
      // No need to show toast for background errors
    } finally {
      setIsPerformingBackgroundAnalysis(false);
    }
  };
  
  const handleSkillLevelChange = (level: StockfishLevel) => {
    setSkillLevel(level);
    setStockfishSkillLevel(level);
    
    // Check if we already have analysis for this level
    if (analysisCache.has(level)) {
      // Use cached analysis
      setAnalyzedMoves(analysisCache.get(level) || []);
      
      // Keep current move selected if possible
      if (currentMoveIndex >= 0) {
        const cachedMoves = analysisCache.get(level) || [];
        setCurrentMoveIndex(Math.min(currentMoveIndex, cachedMoves.length - 1));
      }
      
      return;
    }
    
    // Fall back to re-analyzing if not in cache
    if (pgn && pgn.trim() && !isAnalyzing && analyzedMoves.length > 0) {
      toast.info(`Generating analysis with engine level ${level}...`);
      
      // Store current move index to restore after analysis
      const currentIndex = currentMoveIndex;
      
      // Analyze with the new skill level
      analyzeGame(
        pgn,
        level,
        15,
        (progress) => {
          if (progress % 10 === 0) {
            toast.info(`Analysis progress: ${progress}%`);
          }
        }
      ).then(result => {
        if (result.length > 0) {
          // Add to cache
          const newCache = new Map(analysisCache);
          newCache.set(level, result);
          setAnalysisCache(newCache);
          
          setAnalyzedMoves(result);
          // Restore the previous move selection
          setCurrentMoveIndex(Math.min(currentIndex, result.length - 1));
          toast.success('Analysis updated with new engine strength!');
        }
      }).catch(error => {
        console.error('Failed to update analysis:', error);
        toast.error('Failed to update analysis with new engine strength');
      });
    }
  };
  
  const handleNewAnalysis = () => {
    setPgn('');
    setAnalyzedMoves([]);
    setCurrentMoveIndex(-1);
    setShowingUploader(true);
    setAnalysisCache(new Map()); // Clear cache
  };
  
  // Handlers for arrow visualization
  const handleBestMoveClick = () => {
    if (chessboardRef.current && chessboardRef.current.handleBestMoveClick) {
      chessboardRef.current.handleBestMoveClick();
    }
    setSelectedMoveType('best');
    setSelectedAlternativeIndex(undefined);
  };
  
  const handleAlternativeMoveClick = (index: number) => {
    if (chessboardRef.current && chessboardRef.current.handleAlternativeMoveClick) {
      chessboardRef.current.handleAlternativeMoveClick(index);
    }
    setSelectedMoveType('alternative');
    setSelectedAlternativeIndex(index);
  };
  
  // Reset to played move when changing moves
  useEffect(() => {
    setSelectedMoveType('played');
    setSelectedAlternativeIndex(undefined);
  }, [currentMoveIndex]);
  
  const currentAnalyzedMove = analyzedMoves[currentMoveIndex];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <NavBar onNewAnalysis={handleNewAnalysis} showNewAnalysis={!showingUploader} />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-2 sm:px-4 md:px-2 max-w-full lg:max-w-[95%] xl:max-w-[90%] 2xl:max-w-[85%]">
          <Toaster position="top-center" />
          
          {engineError && (
            <div className="max-w-lg mx-auto mb-6 p-5 bg-red-50 border border-red-100 text-red-800 rounded-lg shadow-md dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
              <h3 className="font-bold flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600 dark:text-red-400">
                  <path d="M12 9v4M12 16h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Engine Error
              </h3>
              <p className="mt-1">{engineError}</p>
              <p className="mt-2 text-sm">
                This app requires the Stockfish engine to be available in your browser. 
                Please ensure you're using a modern browser and try reloading the page.
              </p>
            </div>
          )}
          
          {showingUploader ? (
            <div className="max-w-4xl mx-auto">
              <PgnUploader onPgnSubmit={handlePgnSubmit} />
            </div>
          ) : (
            <div className="space-y-8">              
              {isAnalyzing ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-2 border-primary mb-4"></div>
                  <h3 className="text-xl font-medium mb-4">Analyzing your game...</h3>
                  <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {progress}% complete
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-5 lg:gap-6">
                  <div className="lg:col-span-9 xl:col-span-9">
                    <ChessboardDisplay 
                      ref={chessboardRef}
                      pgn={pgn} 
                      analyzedMoves={analyzedMoves}
                      currentMoveIndex={currentMoveIndex}
                      onMoveSelected={setCurrentMoveIndex}
                      showMovesList={false}
                    />
                  </div>
                  
                  <div className="lg:col-span-3 xl:col-span-3 space-y-4">
                    <AnalysisDisplay 
                      analyzedMove={currentAnalyzedMove}
                      skillLevel={skillLevel}
                      onSkillLevelChange={handleSkillLevelChange}
                      backgroundAnalysisProgress={backgroundAnalysisProgress}
                      isPerformingBackgroundAnalysis={isPerformingBackgroundAnalysis}
                      onBestMoveClick={handleBestMoveClick}
                      onAlternativeMoveClick={handleAlternativeMoveClick}
                      selectedMoveType={selectedMoveType}
                      selectedAlternativeIndex={selectedAlternativeIndex}
                    />
                    
                    {/* Moves List */}
                    <Card className="overflow-hidden shadow-md border-0">
                      <CardContent className="pt-4">
                        <div className="overflow-y-auto max-h-72 border rounded-md">
                          <div className="grid grid-cols-2 md:grid-cols-2 gap-1 p-1">
                            {!isAnalyzing && analyzedMoves.length > 0 && analyzedMoves.map((move, index) => (
                              <div 
                                key={index}
                                className={`p-1.5 rounded text-sm cursor-pointer transition-colors
                                  ${index === currentMoveIndex ? 'ring-2 ring-primary' : 'hover:bg-accent'}
                                  ${
                                    move.classification === 'best' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                    move.classification === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                                    move.classification === 'inaccuracy' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                                    move.classification === 'mistake' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' :
                                    move.classification === 'blunder' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : ''
                                  }
                                `}
                                onClick={() => setCurrentMoveIndex(index)}
                              >
                                <div className="flex justify-between items-center">
                                  <span>{`${Math.floor(index / 2) + 1}${index % 2 === 0 ? '.' : '...'}`}</span>
                                  <span className="font-bold">{move.move}</span>
                                </div>
                              </div>
                            ))}
                            
                            {(!analyzedMoves || analyzedMoves.length === 0) && !isAnalyzing && (
                              <div className="text-center py-4 text-muted-foreground col-span-2">
                                No moves to display
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              {/* Game Summary as popup overlay */}
              {analyzedMoves.length > 0 && (
                <GameSummary 
                  analyzedMoves={analyzedMoves} 
                  onMoveSelected={setCurrentMoveIndex} 
                />
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mt-1">© {new Date().getFullYear()} Chess Analyzer. Open source under the <a href="https://github.com/anujayghosh/chess-analyzer/blob/main/LICENSE" className="underline hover:text-blue-600" target="_blank" rel="noopener noreferrer">MIT License</a></p>
        </div>
      </footer>
    </div>
  );
} 