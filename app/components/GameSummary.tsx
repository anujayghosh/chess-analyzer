'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AnalyzedMove, MoveClassification, formatMateScore } from '../lib/stockfish/stockfish-service';
import { Button } from '@/components/ui/button';
import { 
  X, 
  BarChart2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  XCircle, 
  ArrowDown,
  AlertTriangle,
  ThumbsUp,
  Bookmark,
  Zap,
  Award,
  Star,
  Check,
  HelpCircle,
  Search,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

interface GameSummaryProps {
  analyzedMoves: AnalyzedMove[];
  onMoveSelected?: (index: number) => void;
  playerNames?: { white: string; black: string };
  playerAvatars?: { white: string; black: string };
}

// Helper function to determine the color for evaluation values
const getEvaluationColor = (value: number) => {
  // Mate scores should have a special color
  const { isMate } = formatMateScore(value);
  if (isMate) {
    return value > 0 ? 'text-pink-600' : 'text-orange-600';
  }

  const absValue = Math.abs(value);
  if (absValue < 0.3) return 'text-gray-600';
  if (absValue < 0.8) return 'text-blue-600';
  if (absValue < 1.5) return 'text-green-600';
  if (absValue < 3) return 'text-yellow-600';
  return 'text-red-600';
};

// Format evaluation for display
const formatEvaluation = (score: number) => {
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

export default function GameSummary({ 
  analyzedMoves, 
  onMoveSelected,
  playerNames = { white: 'Player 1', black: 'Player 2' },
  playerAvatars = { white: '', black: '' } 
}: GameSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAllCriticalMoves, setShowAllCriticalMoves] = useState(false);

  const toggleSummary = () => setIsOpen(!isOpen);
  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const toggleShowAllCriticalMoves = () => setShowAllCriticalMoves(!showAllCriticalMoves);

  // Handle keyboard events to close the summary
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === 'Escape' || e.key === 'Backspace')) {
        e.preventDefault();
        toggleSummary();
      }
    };

    // Only add the event listener when the summary is open
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Clean up the event listener when component unmounts or when isOpen changes
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]); // Re-run effect when isOpen changes

  // Function to navigate to a specific move
  const navigateToMove = (moveNumber: number, playerColor: 'w' | 'b') => {
    if (!onMoveSelected) return;
    
    // Find the index of the move in analyzedMoves
    const moveIndex = analyzedMoves.findIndex(
      move => move.moveNumber === moveNumber && move.playerColor === playerColor
    );
    
    if (moveIndex !== -1) {
      // Navigate to the move
      onMoveSelected(moveIndex);
      
      // Minimize the summary to see the board
      setIsMinimized(true);
    }
  };

  const summary = useMemo(() => {
    if (!analyzedMoves || analyzedMoves.length === 0) {
      return null;
    }
    
    const whiteMoves = analyzedMoves.filter(move => move.playerColor === 'w');
    const blackMoves = analyzedMoves.filter(move => move.playerColor === 'b');
    
    // Count move classifications
    const whiteCounts = {
      brilliant: whiteMoves.filter(move => move.evaluation.score > 5).length,
      great: whiteMoves.filter(move => move.evaluation.score > 3 && move.evaluation.score <= 5).length,
      best: whiteMoves.filter(move => move.classification === 'best').length,
      excellent: whiteMoves.filter(move => move.evaluation.score > 1.5 && move.evaluation.score <= 3).length,
      good: whiteMoves.filter(move => move.classification === 'good').length,
      book: whiteMoves.filter(move => move.evaluation.score > -0.5 && move.evaluation.score < 0.5).length,
      inaccuracy: whiteMoves.filter(move => move.classification === 'inaccuracy').length,
      mistake: whiteMoves.filter(move => move.classification === 'mistake').length,
      blunder: whiteMoves.filter(move => move.classification === 'blunder').length,
      miss: whiteMoves.filter(move => move.classification === 'blunder' && Math.abs(move.evaluation.score) > 3).length,
    };
    
    const blackCounts = {
      brilliant: blackMoves.filter(move => move.evaluation.score < -5).length,
      great: blackMoves.filter(move => move.evaluation.score < -3 && move.evaluation.score >= -5).length,
      best: blackMoves.filter(move => move.classification === 'best').length,
      excellent: blackMoves.filter(move => move.evaluation.score < -1.5 && move.evaluation.score >= -3).length,
      good: blackMoves.filter(move => move.classification === 'good').length,
      book: blackMoves.filter(move => move.evaluation.score > -0.5 && move.evaluation.score < 0.5).length,
      inaccuracy: blackMoves.filter(move => move.classification === 'inaccuracy').length,
      mistake: blackMoves.filter(move => move.classification === 'mistake').length,
      blunder: blackMoves.filter(move => move.classification === 'blunder').length,
      miss: blackMoves.filter(move => move.classification === 'blunder' && Math.abs(move.evaluation.score) > 3).length,
    };
    
    // Calculate accuracy
    const calculateAccuracy = (moves: AnalyzedMove[]) => {
      if (moves.length === 0) return 0;
      
      // Simple accuracy model: weight each move type
      const weights: Record<string, number> = {
        best: 1.0,
        excellent: 0.95,
        good: 0.9,
        book: 0.95,
        inaccuracy: 0.7,
        mistake: 0.4,
        blunder: 0.1
      };
      
      let totalWeight = 0;
      for (const move of moves) {
        totalWeight += weights[move.classification as string] || 0;
      }
      
      return Math.round((totalWeight / moves.length) * 100);
    };
    
    const whiteAccuracy = calculateAccuracy(whiteMoves);
    const blackAccuracy = calculateAccuracy(blackMoves);
    
    // Find critical moments (mistakes and blunders)
    const criticalMoments = analyzedMoves
      .filter(move => move.classification === 'mistake' || move.classification === 'blunder')
      .map(move => ({
        moveNumber: move.moveNumber,
        playerColor: move.playerColor,
        move: move.move,
        classification: move.classification,
        evaluation: move.evaluation,
        // Add the moveIndex for navigation
        moveIndex: analyzedMoves.findIndex(m => 
          m.moveNumber === move.moveNumber && m.playerColor === move.playerColor
        )
      }));
    
    // Prepare data for line chart
    const chartData = analyzedMoves.map((move, index) => {
      // Create a notation like 1.e4 or 1...e5
      const moveNotation = move.playerColor === 'w' 
        ? `${move.moveNumber}.` 
        : `${move.moveNumber}...`;
      
      return {
        id: index,
        name: `${moveNotation}${move.move}`,
        evaluation: move.evaluation.score,
        moveNumber: move.moveNumber,
        playerColor: move.playerColor,
      };
    });
    
    return {
      totalMoves: analyzedMoves.length,
      whiteMoves: whiteMoves.length,
      blackMoves: blackMoves.length,
      whiteCounts,
      blackCounts,
      whiteAccuracy,
      blackAccuracy,
      criticalMoments,
      chartData
    };
  }, [analyzedMoves]);

  if (!summary) {
    return null;
  }

  // Icons for move categories
  const categoryIcons = {
    brilliant: <Zap className="h-5 w-5 text-teal-500" />,
    great: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    best: <Star className="h-5 w-5 text-green-500" />,
    excellent: <ThumbsUp className="h-5 w-5 text-green-600" />,
    good: <Check className="h-5 w-5 text-blue-500" />,
    book: <Bookmark className="h-5 w-5 text-purple-500" />,
    inaccuracy: <AlertTriangle className="h-5 w-5 rotate-180 text-yellow-500" />,
    mistake: <HelpCircle className="h-5 w-5 text-orange-500" />,
    miss: <XCircle className="h-5 w-5 text-red-500" />
  };

  // Toggle button that always stays at the bottom
  const SummaryToggleButton = () => (
    <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center">
      <Button
        onClick={toggleSummary}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg px-4 py-2 rounded-full hover:shadow-xl transition-shadow flex items-center animate-pulse-slow"
        size="sm"
      >
        <BarChart2 className="mr-2 h-4 w-4" />
        <span>Game Summary</span>
        <span className="ml-1 text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full">
          {summary.whiteAccuracy}% / {summary.blackAccuracy}%
        </span>
      </Button>
    </div>
  );

  // Minimized version that shows just the player accuracy
  const MinimizedSummary = () => (
    <div className="bg-white rounded-t-lg shadow-xl p-3 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="text-center px-3 py-1 bg-gray-50 border-l-4 border-gray-300 rounded">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-white border border-gray-300 mr-1"></div>
            <span className="text-xs font-medium text-gray-700">{playerNames.white}</span>
          </div>
          <div className="font-bold text-md">{summary.whiteAccuracy}%</div>
        </div>
        <div className="text-center px-3 py-1 bg-gray-50 border-l-4 border-gray-400 rounded">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-black border border-gray-300 mr-1"></div>
            <span className="text-xs font-medium text-gray-700">{playerNames.black}</span>
          </div>
          <div className="font-bold text-md">{summary.blackAccuracy}%</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100" 
          onClick={toggleMinimize}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100" 
          onClick={toggleSummary}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (!isOpen) {
    return <SummaryToggleButton />;
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 w-full flex justify-center z-30">
        <div className="w-full max-w-md">
          <MinimizedSummary />
        </div>
      </div>
    );
  }

  // Determine how many critical moves to show
  const criticalMovesToShow = showAllCriticalMoves 
    ? summary.criticalMoments 
    : summary.criticalMoments.slice(0, 5);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 p-2 rounded shadow-lg text-xs">
          <p className="font-semibold text-gray-900">{`Move: ${data.name}`}</p>
          <p className={`${getEvaluationColor(data.evaluation)}`}>
            Evaluation: {formatEvaluation(data.evaluation)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col m-3">
        <div className="p-2 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Game Summary</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100" 
              onClick={toggleSummary}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Game Evaluation Chart */}
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="w-full h-36 p-2 border border-gray-200 rounded-lg overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={false}
                  axisLine={false}
                  hide={true}
                />
                <YAxis 
                  domain={[-5, 5]} 
                  hide={true}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="whiteArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(75,85,99,0.9)" />
                    <stop offset="100%" stopColor="rgba(55,65,81,0.9)" />
                  </linearGradient>
                  <linearGradient id="blackArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(243,244,246,0.9)" />
                    <stop offset="100%" stopColor="rgba(229,231,235,0.9)" />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey={(d) => d.evaluation > 0 ? d.evaluation : 0}
                  stroke="none"
                  fill="url(#whiteArea)"
                  fillOpacity={1}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey={(d) => d.evaluation < 0 ? d.evaluation : 0}
                  stroke="none"
                  fill="url(#blackArea)"
                  fillOpacity={1}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="evaluation"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#4F46E5' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Player Info */}
        <div className="grid grid-cols-2 bg-white p-2 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-3 p-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-md overflow-hidden border-2 border-green-500">
                {playerAvatars.white ? (
                  <img src={playerAvatars.white} alt={playerNames.white} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white border border-gray-300"></div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700">{playerNames.white}</div>
              <div className="text-2xl font-bold text-gray-900">{summary.whiteAccuracy}.</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3 p-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-md overflow-hidden border-2 border-green-500">
                {playerAvatars.black ? (
                  <img src={playerAvatars.black} alt={playerNames.black} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-black border border-gray-300"></div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700">{playerNames.black}</div>
              <div className="text-2xl font-bold text-gray-900">{summary.blackAccuracy}.</div>
            </div>
          </div>
        </div>

        {/* Move Categories - Centered Layout with aligned numbers */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="grid grid-cols-3 border-b border-gray-200">
            <div className="py-2 px-2 pl-8 font-medium text-gray-900 text-sm"></div>
            <div className="py-2 px-2 text-center font-medium text-gray-900 text-sm">Accuracy</div>
            <div className="py-2 px-2 pr-8 text-right font-medium text-gray-900 text-sm"></div>
          </div>
          
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold">{summary.whiteAccuracy}.</span>
            </div>
            <div className="py-2 px-2"></div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold">{summary.blackAccuracy}.</span>
            </div>
          </div>
          
          {/* Brilliant */}
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold text-teal-500">{summary.whiteCounts.brilliant}</span>
            </div>
            <div className="py-2 px-2 flex justify-center items-center text-gray-900">
              <span className="flex items-center">
                {categoryIcons.brilliant}
                <span className="ml-2 font-medium">Brilliant</span>
              </span>
            </div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold text-teal-500">{summary.blackCounts.brilliant}</span>
            </div>
          </div>
          
          {/* Great */}
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold text-amber-500">{summary.whiteCounts.great}</span>
            </div>
            <div className="py-2 px-2 flex justify-center items-center text-gray-900">
              <span className="flex items-center">
                {categoryIcons.great}
                <span className="ml-2 font-medium">Great</span>
              </span>
            </div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold text-amber-500">{summary.blackCounts.great}</span>
            </div>
          </div>
          
          {/* Best */}
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold text-green-500">{summary.whiteCounts.best}</span>
            </div>
            <div className="py-2 px-2 flex justify-center items-center text-gray-900">
              <span className="flex items-center">
                {categoryIcons.best}
                <span className="ml-2 font-medium">Best</span>
              </span>
            </div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold text-green-500">{summary.blackCounts.best}</span>
            </div>
          </div>
          
          {/* Excellent */}
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold text-green-600">{summary.whiteCounts.excellent}</span>
            </div>
            <div className="py-2 px-2 flex justify-center items-center text-gray-900">
              <span className="flex items-center">
                {categoryIcons.excellent}
                <span className="ml-2 font-medium">Excellent</span>
              </span>
            </div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold text-green-600">{summary.blackCounts.excellent}</span>
            </div>
          </div>
          
          {/* Good */}
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold text-blue-500">{summary.whiteCounts.good}</span>
            </div>
            <div className="py-2 px-2 flex justify-center items-center text-gray-900">
              <span className="flex items-center">
                {categoryIcons.good}
                <span className="ml-2 font-medium">Good</span>
              </span>
            </div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold text-blue-500">{summary.blackCounts.good}</span>
            </div>
          </div>
          
          {/* Book */}
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold text-purple-500">{summary.whiteCounts.book}</span>
            </div>
            <div className="py-2 px-2 flex justify-center items-center text-gray-900">
              <span className="flex items-center">
                {categoryIcons.book}
                <span className="ml-2 font-medium">Book</span>
              </span>
            </div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold text-purple-500">{summary.blackCounts.book}</span>
            </div>
          </div>
          
          {/* Inaccuracy */}
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold text-yellow-500">{summary.whiteCounts.inaccuracy}</span>
            </div>
            <div className="py-2 px-2 flex justify-center items-center text-gray-900">
              <span className="flex items-center">
                {categoryIcons.inaccuracy}
                <span className="ml-2 font-medium">Inaccuracy</span>
              </span>
            </div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold text-yellow-500">{summary.blackCounts.inaccuracy}</span>
            </div>
          </div>
          
          {/* Mistake */}
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold text-orange-500">{summary.whiteCounts.mistake}</span>
            </div>
            <div className="py-2 px-2 flex justify-center items-center text-gray-900">
              <span className="flex items-center">
                {categoryIcons.mistake}
                <span className="ml-2 font-medium">Mistake</span>
              </span>
            </div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold text-orange-500">{summary.blackCounts.mistake}</span>
            </div>
          </div>
          
          {/* Miss */}
          <div className="grid grid-cols-3 border-b border-gray-200 items-center">
            <div className="py-2 px-2 pl-8 text-right">
              <span className="text-lg font-semibold text-red-500">{summary.whiteCounts.miss}</span>
            </div>
            <div className="py-2 px-2 flex justify-center items-center text-gray-900">
              <span className="flex items-center">
                {categoryIcons.miss}
                <span className="ml-2 font-medium">Miss</span>
              </span>
            </div>
            <div className="py-2 px-2 pr-8 text-left">
              <span className="text-lg font-semibold text-red-500">{summary.blackCounts.miss}</span>
            </div>
          </div>
        </div>
        
        {/* Back to Analysis Button */}
        <div className="p-4 bg-white border-t border-gray-200">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md"
            onClick={toggleSummary}
          >
            Back to Analysis
          </Button>
        </div>
      </div>
    </div>
  );
} 