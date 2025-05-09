'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { AnalyzedMove, StockfishLevel, formatMateScore } from '../lib/stockfish/stockfish-service';
import { 
  ArrowUp, 
  ArrowDown, 
  BadgeCheck, 
  AlertTriangle, 
  XCircle,

  Zap,
  Star,
  ThumbsUp,
  Check,
  Bookmark,
  HelpCircle
} from 'lucide-react';

interface AnalysisDisplayProps {
  analyzedMove?: AnalyzedMove;
  skillLevel: StockfishLevel;
  onSkillLevelChange: (level: StockfishLevel) => void;
  backgroundAnalysisProgress?: number;
  isPerformingBackgroundAnalysis?: boolean;
}

export default function AnalysisDisplay({
  analyzedMove,
  skillLevel,
  onSkillLevelChange,
  backgroundAnalysisProgress = 0,
  isPerformingBackgroundAnalysis = false
}: AnalysisDisplayProps) {
  // Helper functions for displaying analysis
  const getClassificationLabel = (classification: string) => {
    switch (classification) {
      case 'brilliant': return 'Brilliant Move';
      case 'great': return 'Great Move';
      case 'best': return 'Best Move';
      case 'excellent': return 'Excellent Move';
      case 'good': return 'Good Move';
      case 'book': return 'Book Move';
      case 'inaccuracy': return 'Inaccuracy';
      case 'mistake': return 'Mistake';
      case 'miss': return 'Miss';
      case 'blunder': return 'Blunder';
      default: return classification;
    }
  };
  
  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'brilliant': return <Zap className="h-5 w-5 text-teal-600 dark:text-teal-400" />;
      case 'great': return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'best': return <Star className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'excellent': return <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'good': return <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'book': return <Bookmark className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'inaccuracy': return <AlertTriangle className="h-5 w-5 rotate-180 text-yellow-600 dark:text-yellow-400" />;
      case 'mistake': return <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'miss': return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'blunder': return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default: return null;
    }
  };
  
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'brilliant': return 'text-teal-600 dark:text-teal-400';
      case 'great': return 'text-amber-600 dark:text-amber-400';
      case 'best': return 'text-green-600 dark:text-green-400';
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'book': return 'text-purple-600 dark:text-purple-400';
      case 'inaccuracy': return 'text-yellow-600 dark:text-yellow-400';
      case 'mistake': return 'text-orange-600 dark:text-orange-400';
      case 'miss': return 'text-red-600 dark:text-red-400';
      case 'blunder': return 'text-red-600 dark:text-red-400';
      default: return '';
    }
  };
  
  const getClassificationBackground = (classification: string) => {
    switch (classification) {
      case 'brilliant': return 'bg-teal-50 dark:bg-teal-900/20';
      case 'great': return 'bg-amber-50 dark:bg-amber-900/20';
      case 'best': return 'bg-green-50 dark:bg-green-900/20';
      case 'excellent': return 'bg-green-50 dark:bg-green-900/20';
      case 'good': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'book': return 'bg-purple-50 dark:bg-purple-900/20';
      case 'inaccuracy': return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'mistake': return 'bg-orange-50 dark:bg-orange-900/20';
      case 'miss': return 'bg-red-50 dark:bg-red-900/20';
      case 'blunder': return 'bg-red-50 dark:bg-red-900/20';
      default: return 'bg-gray-50 dark:bg-gray-800';
    }
  };
  
  const formatScore = (score: number) => {
    // Check if it's a mate score
    const { isMate, mateIn } = formatMateScore(score);
    
    if (isMate && mateIn !== undefined) {
      return score > 0 ? `M${mateIn}` : `-M${mateIn}`;
    }
    
    // Regular evaluation score
    const formatted = Math.abs(score).toFixed(1);
    return score >= 0 
      ? `+${formatted}` 
      : `-${formatted}`;
  };
  
  const getPlayerColor = (color: 'w' | 'b') => {
    return color === 'w' ? 'White' : 'Black';
  };
  
  return (
    <div className="grid grid-cols-1 gap-3">
      <Card className="overflow-hidden shadow-md border-0">
        <CardContent className="pt-3 pb-3">
          {/* Engine Strength Settings - Collapsible Section */}
          <div className="mb-3 border-b pb-3">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 10H7C9 10 10 9 10 7V5C10 3 9 2 7 2H5C3 2 2 3 2 5V7C2 9 3 10 5 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 22H19C21 22 22 21 22 19V17C22 15 21 14 19 14H17C15 14 14 15 14 17V19C14 21 15 22 17 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Engine Strength
                </span>
                <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                  Level {skillLevel}
                </span>
                <svg className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-2 px-1">
                <Slider
                  defaultValue={[skillLevel]}
                  max={20}
                  min={1}
                  step={1}
                  onValueChange={(values) => onSkillLevelChange(values[0] as StockfishLevel)}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Master</span>
                </div>
                
                {isPerformingBackgroundAnalysis && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Background analysis: {backgroundAnalysisProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300" 
                        style={{ width: `${backgroundAnalysisProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>

          {analyzedMove ? (
            <div className="space-y-5">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${getClassificationBackground(analyzedMove.classification)}`}>
                <div className="flex-shrink-0">
                  {getClassificationIcon(analyzedMove.classification)}
                </div>
                <div className="flex-grow">
                  <div className={`text-lg font-bold ${getClassificationColor(analyzedMove.classification)}`}>
                    {getClassificationLabel(analyzedMove.classification)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Move {analyzedMove.moveNumber} ({getPlayerColor(analyzedMove.playerColor)})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {analyzedMove.move}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Evaluation</div>
                  <div className="text-xl font-bold">
                    {formatScore(analyzedMove.evaluation.score)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Best Move</div>
                  <div className="text-xl font-bold">
                    {analyzedMove.evaluation.bestMove}
                  </div>
                </div>
              </div>
              
              {analyzedMove.evaluation.pv && analyzedMove.evaluation.pv.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:shadow-md transition-shadow">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Best line of play
                      </div>
                      <svg className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="text-md font-medium mt-2 font-mono text-gray-700 dark:text-gray-300 overflow-x-auto animate-fadeIn">
                      {analyzedMove.evaluation.pv.slice(0, 5).join(' ')}
                    </div>
                  </details>
                </div>
              )}
              
              {analyzedMove.evaluation.alternatives && analyzedMove.evaluation.alternatives.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:shadow-md transition-shadow">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Alternative Moves
                      </div>
                      <svg className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="space-y-2 mt-2 animate-fadeIn">
                      {analyzedMove.evaluation.alternatives.slice(0, 3).map((alt, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <span className="font-mono">{alt.move}</span>
                          <span className={`font-medium ${alt.score >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatScore(alt.score)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
              <div className="text-lg font-medium">Select a move on the board</div>
              <p className="text-sm text-muted-foreground">
                Analysis details will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 