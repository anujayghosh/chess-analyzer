'use client';

import React from 'react';
import { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { AnalyzedMove, formatMateScore, MoveClassification } from '../lib/stockfish/stockfish-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronFirst, 
  ChevronLast, 
  ChevronLeft, 
  ChevronRight,
  Zap, 
  AlertTriangle, 
  Star, 
  ThumbsUp, 
  Check, 
  Bookmark, 
  XCircle,
  HelpCircle
} from 'lucide-react';

// Custom hook for monitoring element size
function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

// Simple Badge component since we don't have access to the UI library's Badge
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <span className={`inline-flex items-center rounded-lg font-medium shadow-md ${className}`}>
      {children}
    </span>
  );
};

interface ChessboardDisplayProps {
  pgn: string;
  analyzedMoves?: AnalyzedMove[];
  currentMoveIndex?: number;
  onMoveSelected?: (index: number) => void;
  showMovesList?: boolean;
}

// Export a type for the imperative handle
export type ChessboardDisplayHandle = {
  handleBestMoveClick: () => void;
  handleAlternativeMoveClick: (index: number) => void;
};

// Define component function without forwardRef first
function ChessboardDisplayComponent(
  props: ChessboardDisplayProps, 
  ref: React.ForwardedRef<ChessboardDisplayHandle>
) {
  const { 
    pgn, 
    analyzedMoves = [], 
    currentMoveIndex = -1, 
    onMoveSelected, 
    showMovesList = true 
  } = props;

  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [moves, setMoves] = useState<any[]>([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const [boardWidth, setBoardWidth] = useState(500);
  const [highlightedSquares, setHighlightedSquares] = useState<{[key: string]: React.CSSProperties}>({});
  const [pieceIcons, setPieceIcons] = useState<{[key: string]: React.ReactNode}>({});
  // New state for arrows - using any[] to avoid potential type issues with the external library
  const [arrows, setArrows] = useState<any[]>([]);
  // New state to track if we're showing best move or alternative move
  const [selectedMove, setSelectedMove] = useState<{type: 'played' | 'best' | 'alternative', index?: number} | null>(null);
  const containerRef = useRef(null);
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    handleBestMoveClick: () => {
      showBestMoveArrow();
      setSelectedMove({ type: 'best' });
    },
    handleAlternativeMoveClick: (index: number) => {
      showAlternativeMoveArrow(index);
      setSelectedMove({ type: 'alternative', index });
    }
  }));
  
  // Responsive board sizing with resize observer
  useEffect(() => {
    const handleResize = () => {
      // Calculate container width (accounting for padding and margins)
      const containerWidth = containerRef.current ? 
        (containerRef.current as HTMLElement).clientWidth - 24 : // Reduced padding subtraction
        window.innerWidth;
      
      // Enhanced responsive width calculation that utilizes more screen space
      const width = Math.min(
        900, // Substantially increased maximum width for large screens
        containerWidth > 1400 ? containerWidth * 0.65 : // Increased scale for extra-large screens
        containerWidth > 1200 ? containerWidth * 0.6 : // Increased scale for large screens
        containerWidth > 768 ? containerWidth * 0.58 : // Increased scale for medium screens
        containerWidth * 0.9 // Maximum scale for mobile screens
      );
      
      // Update board width
      setBoardWidth(width);
      
      // Make sure the evaluation bar styles properly update when DOM is ready
      setTimeout(() => {
        const evalBar = document.querySelector('.evaluation-bar') as HTMLElement;
        if (evalBar) {
          if (window.innerWidth >= 768) {
            // On desktop, match the height of the chessboard
            evalBar.style.height = `${width}px`;
            evalBar.style.width = '16px'; // Doubled width from 8px to 16px
          } else {
            // On mobile, use horizontal layout
            evalBar.style.height = '16px'; // Doubled height from 8px to 16px
            evalBar.style.width = '100%';
          }
        }
      }, 100);
    };
    
    handleResize(); // Initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Helper function to convert chess.js algebraic notation to coordinates
  const squareToCoordinates = (square: string) => {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(square.charAt(1));
    return { x: file, y: rank };
  };

  // Helper function to calculate the arrow path that avoids overlapping pieces
  const calculateArrowPath = (from: string, to: string) => {
    const fromCoord = squareToCoordinates(from);
    const toCoord = squareToCoordinates(to);
    
    // Calculate direction vector
    const dx = toCoord.x - fromCoord.x;
    const dy = toCoord.y - fromCoord.y;
    
    // Normalize the vector length to avoid overlapping the piece
    const length = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = dx / length;
    const normalizedDy = dy / length;
    
    // End coordinates that don't overlap the piece (reduce by 0.3 squares)
    const endX = toCoord.x - normalizedDx * 0.3;
    const endY = toCoord.y - normalizedDy * 0.3;
    
    return {
      sourceX: fromCoord.x + 0.5, // Center of the source square
      sourceY: fromCoord.y + 0.5, // Center of the source square
      targetX: endX + 0.5, // Adjusted end point + center offset
      targetY: endY + 0.5, // Adjusted end point + center offset
    };
  };
  
  // Load PGN
  useEffect(() => {
    if (pgn) {
      try {
        chess.loadPgn(pgn);
        setFen(chess.fen());
        const history = chess.history({ verbose: true });
        setMoves(history);
        
        // Reset to starting position
        chess.reset();
        setFen(chess.fen());
        setCurrentMove(-1);
        
        // Select first move automatically if available
        if (history.length > 0 && typeof onMoveSelected === 'function') {
          setTimeout(() => {
            navigateToMove(0);
          }, 300);
        }
      } catch (e) {
        console.error('Invalid PGN format', e);
      }
    }
  }, [pgn, chess]);
  
  // Sync with external current move index
  useEffect(() => {
    if (currentMoveIndex >= -1 && currentMoveIndex !== currentMove && currentMoveIndex < moves.length) {
      navigateToMove(currentMoveIndex);
    }
  }, [currentMoveIndex]);

  // Icons for move classifications
  const getMoveClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'brilliant': return <Zap className="h-5 w-5 text-teal-500" />;
      case 'great': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'best': return <Star className="h-5 w-5 text-green-500" />;
      case 'excellent': return <ThumbsUp className="h-5 w-5 text-green-600" />;
      case 'good': return <Check className="h-5 w-5 text-blue-500" />;
      case 'book': return <Bookmark className="h-5 w-5 text-purple-500" />;
      case 'inaccuracy': return <AlertTriangle className="h-5 w-5 rotate-180 text-yellow-500" />;
      case 'mistake': return <HelpCircle className="h-5 w-5 text-orange-500" />;
      case 'miss': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'blunder': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  // Get classification label matching GameSummary terminology
  const getClassificationLabel = (classification: string) => {
    switch (classification) {
      case 'best': return 'Best';
      case 'good': return 'Good';
      case 'inaccuracy': return 'Inaccuracy';
      case 'mistake': return 'Mistake';
      case 'blunder': return 'Blunder';
      case 'brilliant': return 'Brilliant';
      case 'great': return 'Great';
      case 'excellent': return 'Excellent';
      case 'book': return 'Book';
      case 'miss': return 'Miss';
      default: return classification;
    }
  };

  // Update highlighted squares and arrows when current move changes
  useEffect(() => {
    if (currentMove >= 0 && currentMove < moves.length) {
      const move = moves[currentMove];
      const classification = analyzedMoves[currentMove]?.classification || 'good';
      
      // Determine the color for the highlight based on classification
      let startColor = 'rgba(255, 213, 105, 0.4)'; // Default from color
      let endColor;
      
      switch (classification) {
        case 'brilliant':
        case 'great':
        case 'best':
        case 'excellent':
        case 'good':
          endColor = 'rgba(106, 168, 79, 0.5)'; // Green for good moves
          break;
        case 'inaccuracy':
          endColor = 'rgba(255, 202, 58, 0.5)'; // Yellow for inaccuracies
          break;
        case 'mistake':
          endColor = 'rgba(255, 149, 0, 0.5)'; // Orange for mistakes
          break;
        case 'blunder':
        case 'miss':
          endColor = 'rgba(234, 67, 53, 0.5)'; // Red for blunders/misses
          break;
        default:
          endColor = 'rgba(106, 168, 79, 0.5)'; // Default end color
      }

      setHighlightedSquares({
        [move.from]: { 
          backgroundColor: startColor, 
          borderRadius: '8px' 
        },
        [move.to]: { 
          backgroundColor: endColor, 
          borderRadius: '8px'
        }
      });

      // Add classification icon overlay on the destination square
      if (analyzedMoves[currentMove]) {
        const classification = analyzedMoves[currentMove].classification;
        // Set custom piece component to include the icon
        setPieceIcons({
          [move.to]: (
            <div className="relative w-full h-full">
              <div className="absolute top-0 right-0 z-10 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                {getMoveClassificationIcon(classification)}
              </div>
            </div>
          )
        });
      } else {
        setPieceIcons({});
      }

      // Show arrows for the best move by default
      showBestMoveArrow();
      setSelectedMove({ type: 'played' });
    } else {
      setHighlightedSquares({});
      setPieceIcons({});
      setArrows([]);
      setSelectedMove(null);
    }
  }, [currentMove, moves, analyzedMoves]);
  
  // Function to show arrow for the best move
  const showBestMoveArrow = () => {
    if (currentMove >= 0 && currentMove < moves.length && analyzedMoves[currentMove]) {
      const currentAnalyzedMove = analyzedMoves[currentMove];
      
      if (currentAnalyzedMove.evaluation.bestMove) {
        // Parse the best move to get source and target squares
        const moveStr = currentAnalyzedMove.evaluation.bestMove;
        const chess = new Chess(currentAnalyzedMove.fen);
        
        try {
          // Handle the move parsing differently to avoid the sloppy parameter
          // Try first with the move string directly
          let moveObj;
          try {
            moveObj = chess.move(moveStr);
          } catch (e) {
            // If direct move fails, try to parse it manually
            // This handles cases where the move notation might be in different formats
            const moves = chess.moves({ verbose: true });
            moveObj = moves.find(m => m.san === moveStr);
            
            // If still not found, try matching by UCIish format (e.g. "e2e4")
            if (!moveObj && moveStr.length >= 4) {
              const from = moveStr.substring(0, 2);
              const to = moveStr.substring(2, 4);
              moveObj = moves.find(m => m.from === from && m.to === to);
            }
          }
          
          if (moveObj) {
            const { from, to } = moveObj;
            
            // Set the arrow for the best move - using the react-chessboard customArrows format
            // customArrows takes an array of arrays: [['fromSquare', 'toSquare', 'color']]
            setArrows([
              [from, to, "#4CAF50"] // Green color for best move
            ]);
            return;
          }
        } catch (e) {
          console.error('Error parsing best move:', e);
        }
      }
    }
    
    // Clear arrows if no best move can be determined
    setArrows([]);
  };

  // Function to show arrow for an alternative move
  const showAlternativeMoveArrow = (alternativeIndex: number) => {
    if (currentMove >= 0 && 
        currentMove < moves.length && 
        analyzedMoves[currentMove] && 
        analyzedMoves[currentMove].evaluation.alternatives &&
        alternativeIndex < analyzedMoves[currentMove].evaluation.alternatives.length) {
      
      const currentAnalyzedMove = analyzedMoves[currentMove];
      const alternative = currentAnalyzedMove.evaluation.alternatives[alternativeIndex];
      
      if (alternative.move) {
        // Parse the alternative move to get source and target squares
        const moveStr = alternative.move;
        const chess = new Chess(currentAnalyzedMove.fen);
        
        try {
          // Handle the move parsing differently to avoid the sloppy parameter
          // Try first with the move string directly
          let moveObj;
          try {
            moveObj = chess.move(moveStr);
          } catch (e) {
            // If direct move fails, try to parse it manually
            // This handles cases where the move notation might be in different formats
            const moves = chess.moves({ verbose: true });
            moveObj = moves.find(m => m.san === moveStr);
            
            // If still not found, try matching by UCIish format (e.g. "e2e4")
            if (!moveObj && moveStr.length >= 4) {
              const from = moveStr.substring(0, 2);
              const to = moveStr.substring(2, 4);
              moveObj = moves.find(m => m.from === from && m.to === to);
            }
          }
          
          if (moveObj) {
            const { from, to } = moveObj;
            
            // Set the arrow for the alternative move - using the react-chessboard customArrows format
            // customArrows takes an array of arrays: [['fromSquare', 'toSquare', 'color']]
            setArrows([
              [from, to, "#FFA726"] // Orange color for alternative moves
            ]);
            return;
          }
        } catch (e) {
          console.error('Error parsing alternative move:', e);
        }
      }
    }
    
    // Clear arrows if no alternative move can be determined
    setArrows([]);
  };
  
  // Handler for clicking on "Best Move" in the analysis box
  const handleBestMoveClick = () => {
    showBestMoveArrow();
    setSelectedMove({ type: 'best' });
  };

  // Handler for clicking on an alternative move in the analysis box
  const handleAlternativeMoveClick = (index: number) => {
    showAlternativeMoveArrow(index);
    setSelectedMove({ type: 'alternative', index });
  };
  
  // Navigate to a specific move
  const navigateToMove = (index: number) => {
    chess.reset();
    
    // Play all moves up to the index
    for (let i = 0; i <= index && i < moves.length; i++) {
      chess.move(moves[i]);
    }
    
    setFen(chess.fen());
    setCurrentMove(index);
    
    if (onMoveSelected) {
      onMoveSelected(index);
    }
  };
  
  // Navigation functions
  const goToStart = () => navigateToMove(-1);
  const goToPrevMove = () => currentMove > -1 && navigateToMove(currentMove - 1);
  const goToNextMove = () => currentMove < moves.length - 1 && navigateToMove(currentMove + 1);
  const goToEnd = () => navigateToMove(moves.length - 1);
  
  // Add keyboard event listeners for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when the analysis is loaded
      if (moves.length === 0) return;
      
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          goToNextMove();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevMove();
          break;
        case 'ArrowUp':
          e.preventDefault();
          goToStart();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToEnd();
          break;
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentMove, moves.length]); // Re-add listener when these dependencies change
  
  // Format move notation (e.g., "1. e4 e5")
  const formatMoveNotation = (index: number) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const isWhiteMove = index % 2 === 0;
    
    return isWhiteMove
      ? `${moveNumber}. ${moves[index]?.san}`
      : `${moveNumber}... ${moves[index]?.san}`;
  };
  
  // Get move classification styling
  const getMoveClassification = (index: number) => {
    if (!analyzedMoves || index >= analyzedMoves.length || index < 0) return '';
    
    const classification = analyzedMoves[index]?.classification;
    
    switch (classification) {
      case 'brilliant': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100';
      case 'great': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';  
      case 'best': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'excellent': return 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'book': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'inaccuracy': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'mistake': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'miss': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'blunder': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return '';
    }
  };
  
  // Get the evaluation bar styling
  const getEvaluationBarHeight = (score: number = 0) => {
    // Get the current analyzed move if available
    const currentAnalyzedMove = analyzedMoves[currentMove];
    const evaluation = currentAnalyzedMove?.evaluation?.score || score;
    
    // Cap the evaluation at +/- 5 for display purposes
    const cappedScore = Math.max(-5, Math.min(5, evaluation));
    const percentage = 50 - (cappedScore * 10); // Convert to percentage (0-100)
    return `${percentage}%`;
  };

  // Get the evaluation bar width for mobile
  const getEvaluationBarWidth = (score: number = 0) => {
    // Get the current analyzed move if available
    const currentAnalyzedMove = analyzedMoves[currentMove];
    const evaluation = currentAnalyzedMove?.evaluation?.score || score;
    
    // Cap the evaluation at +/- 5 for display purposes
    const cappedScore = Math.max(-5, Math.min(5, evaluation));
    const percentage = 50 + (cappedScore * 10); // Convert to percentage (0-100)
    return `${percentage}%`;
  };

  // Format evaluation value for display
  const formatEvaluation = (score: number) => {
    // Check if it's a mate score
    const { isMate, mateIn } = formatMateScore(score);
    
    if (isMate && mateIn !== undefined) {
      return `M${mateIn}`;
    }
    
    // Regular evaluation score
    return Math.abs(score).toFixed(1);
  };

  return (
    <div className="w-full mx-auto overflow-hidden" ref={containerRef}>
      <Card className="shadow-lg border-0">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-center">
            {/* Evaluation bar on the left */}
            <div className="evaluation-bar w-full md:w-16 h-16 md:h-[500px] mb-4 md:mb-0 flex-shrink-0 md:mr-4 rounded-full overflow-hidden bg-gradient-to-b md:bg-gradient-to-b from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 relative">
              <div 
                className="md:w-full md:h-auto h-full absolute md:bg-gradient-to-b bg-gradient-to-r from-gray-800 to-black md:from-black md:to-gray-800 transition-all duration-500 ease-out"
                style={{
                  height: window.innerWidth >= 768 ? getEvaluationBarHeight() : '100%',
                  width: window.innerWidth < 768 ? getEvaluationBarWidth() : '100%',
                  top: window.innerWidth >= 768 ? '0' : 'auto',
                  left: window.innerWidth < 768 ? '0' : 'auto'
                }}
              />
              
              <div className="hidden md:block absolute top-1/2 left-0 right-0 border-t border-gray-400 dark:border-gray-500" />
              <div className="md:hidden block absolute top-0 bottom-0 left-1/2 border-l border-gray-400 dark:border-gray-500" />
              
              {/* Show evaluation value */}
              {currentMove >= 0 && analyzedMoves[currentMove] && (
                <>
                  {/* Desktop evaluation display */}
                <div className="hidden md:flex absolute top-0 left-0 right-0 bottom-0 text-[10px] items-center justify-center z-10 font-mono font-bold">
                    <div className={`rotate-90 whitespace-nowrap ${analyzedMoves[currentMove].evaluation.score >= 0 ? 'text-black' : 'text-white'}`}>
                      {formatEvaluation(analyzedMoves[currentMove].evaluation.score)}
                    </div>
                  </div>
                  
                  {/* Mobile evaluation display */}
                  <div className="md:hidden flex absolute top-0 left-0 right-0 bottom-0 text-[10px] items-center justify-center z-10 font-mono font-bold">
                    <div className={`whitespace-nowrap ${analyzedMoves[currentMove].evaluation.score >= 0 ? 'text-white' : 'text-black'}`}>
                      {formatEvaluation(analyzedMoves[currentMove].evaluation.score)}
                  </div>
                </div>
                </>
              )}
            </div>
            
            {/* Chessboard - Center it without extra space */}
            <div className="flex-shrink-0 flex flex-col items-center relative">
              <Chessboard 
                position={fen} 
                boardWidth={boardWidth}
                areArrowsAllowed={true}
                customSquareStyles={highlightedSquares}
                customPieces={pieceIcons}
                customArrows={arrows}
                customBoardStyle={{
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                  maxWidth: '100%'
                }}
              />
              
              {/* Controls below the board */}
              <div className="flex justify-between items-center mt-3 w-full">
                <div className="flex space-x-1">
                  <Button onClick={goToStart} variant="outline" size="sm" className="h-8 w-8 p-0 flex items-center justify-center" disabled={currentMove === -1}>
                    <ChevronFirst className="h-4 w-4" />
                  </Button>
                  <Button onClick={goToPrevMove} variant="outline" size="sm" className="h-8 w-8 p-0 flex items-center justify-center" disabled={currentMove === -1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

                {/* Move classification badge - now positioned between the navigation buttons */}
                {currentMove >= 0 && analyzedMoves[currentMove] && (
                  <div className="flex justify-center mx-2">
                    <Badge 
                      className={`px-3 py-1 text-xs font-bold flex items-center ${
                        analyzedMoves[currentMove].classification === 'brilliant' ? 'bg-teal-500 text-white' :
                        analyzedMoves[currentMove].classification === 'great' ? 'bg-amber-500 text-white' :
                        analyzedMoves[currentMove].classification === 'best' ? 'bg-green-500 text-white' : 
                        analyzedMoves[currentMove].classification === 'excellent' ? 'bg-green-600 text-white' :
                        analyzedMoves[currentMove].classification === 'good' ? 'bg-blue-500 text-white' : 
                        analyzedMoves[currentMove].classification === 'book' ? 'bg-purple-500 text-white' :
                        analyzedMoves[currentMove].classification === 'inaccuracy' ? 'bg-yellow-500 text-white' : 
                        analyzedMoves[currentMove].classification === 'mistake' ? 'bg-orange-500 text-white' : 
                        analyzedMoves[currentMove].classification === 'miss' ? 'bg-red-500 text-white' :
                        'bg-red-500 text-white'
                      }`}
                    >
                      <span className="mr-1">
                        {getMoveClassificationIcon(analyzedMoves[currentMove].classification)}
                      </span>
                      {getClassificationLabel(analyzedMoves[currentMove].classification).toUpperCase()}
                    </Badge>
                  </div>
                )}

                <div className="flex space-x-1">
                  <Button onClick={goToNextMove} variant="outline" size="sm" className="h-8 w-8 p-0 flex items-center justify-center" disabled={currentMove === moves.length - 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button onClick={goToEnd} variant="outline" size="sm" className="h-8 w-8 p-0 flex items-center justify-center" disabled={currentMove === moves.length - 1}>
                    <ChevronLast className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Move list below - only show if showMovesList is true */}
          {showMovesList && (
            <div className="mt-6">
              <div className="overflow-y-auto max-h-40 border rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1 p-1">
                  {moves.map((move, index) => (
                    <div 
                      key={index}
                      className={`p-1.5 rounded text-sm cursor-pointer transition-colors flex items-center
                        ${index === currentMove ? 'ring-2 ring-primary' : 'hover:bg-accent'}
                        ${getMoveClassification(index)}
                      `}
                      onClick={() => navigateToMove(index)}
                    >
                      {analyzedMoves[index] && (
                        <span className="mr-1 flex-shrink-0">
                          {getMoveClassificationIcon(analyzedMoves[index].classification)}
                        </span>
                      )}
                      <span>{formatMoveNotation(index)}</span>
                    </div>
                  ))}
                </div>
                
                {moves.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No moves to display
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Add display name to help with debugging
ChessboardDisplayComponent.displayName = 'ChessboardDisplay';

// Export the component properly
export default React.forwardRef<ChessboardDisplayHandle, ChessboardDisplayProps>(ChessboardDisplayComponent); 