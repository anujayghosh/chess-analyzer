import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import stockfishService, { 
  StockfishLevel, 
  StockfishEvaluation,
  AnalyzedMove,
  MoveClassification
} from '../lib/stockfish/stockfish-service';

export function useStockfish() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const initialize = async () => {
      try {
        await stockfishService.initialize();
        setIsInitialized(stockfishService.isInitialized);
      } catch (error) {
        console.error('Failed to initialize Stockfish:', error);
      }
    };

    // Check if already initialized
    if (stockfishService.isInitialized) {
      setIsInitialized(true);
    } else {
      initialize();
    }

    return () => {
      stockfishService.dispose();
    };
  }, []);

  const analyzeFen = async (fen: string): Promise<StockfishEvaluation> => {
    if (typeof window === 'undefined') {
      return Promise.resolve({
        bestMove: 'e2e4',
        score: 0,
        depth: 0,
        pv: ['e2e4'],
        alternatives: []
      });
    }
    return stockfishService.analyzeFen(fen);
  };

  const analyzeGame = async (
    pgn: string, 
    skillLevel: StockfishLevel = 20, 
    depth: number = 15,
    onProgress?: (progress: number) => void
  ): Promise<AnalyzedMove[]> => {
    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Only run in browser environment 
      if (typeof window === 'undefined') {
        return Promise.resolve([]);
      }

      // Parse PGN to count moves for progress tracking
      const moveCount = (pgn.match(/\d+\./g) || []).length * 2;
      
      // Custom implementation to track progress
      const chess = new Chess();
      chess.loadPgn(pgn);
      
      const history = chess.history({ verbose: true });
      const analyzedMoves: AnalyzedMove[] = [];
      
      // Reset chess to start position
      chess.reset();
      
      // Analyze each move
      for (let i = 0; i < history.length; i++) {
        const moveData = history[i];
        const moveNumber = Math.floor(i / 2) + 1;
        const playerColor = i % 2 === 0 ? 'w' : 'b';
        
        // Get position before the move
        const fen = chess.fen();
        
        // Make the move
        chess.move(moveData);
        
        // Analyze the position
        const evaluation = await stockfishService.analyzeFen(fen);
        
        // Classify the move
        const playerMove = moveData.san;
        const bestMove = evaluation.bestMove;
        const scoreDiff = Math.abs(evaluation.score);
        
        let classification: MoveClassification = 'best';
        if (playerMove !== bestMove) {
          if (scoreDiff < 0.3) {
            classification = 'good';
          } else if (scoreDiff < 0.8) {
            classification = 'inaccuracy';
          } else if (scoreDiff < 1.5) {
            classification = 'mistake';
          } else {
            classification = 'blunder';
          }
        }
        
        // Create analyzed move
        analyzedMoves.push({
          fen,
          move: moveData.san,
          moveNumber,
          playerColor,
          evaluation,
          classification
        });
        
        // Update progress
        const currentProgress = Math.floor((i + 1) / history.length * 100);
        setProgress(currentProgress);
        if (onProgress) {
          onProgress(currentProgress);
        }
      }
      
      return analyzedMoves;
    } catch (error) {
      console.error('Analysis failed:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  const setSkillLevel = (level: StockfishLevel): void => {
    stockfishService.setSkillLevel(level);
  };

  const setDepth = (depth: number): void => {
    stockfishService.setDepth(depth);
  };

  return {
    isInitialized,
    isAnalyzing,
    progress,
    analyzeFen,
    analyzeGame,
    setSkillLevel,
    setDepth
  };
} 