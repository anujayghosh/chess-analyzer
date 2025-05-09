import { Chess } from 'chess.js';

// Types for the Stockfish service
export type StockfishLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export interface StockfishEvaluation {
  bestMove: string;
  score: number;
  depth: number;
  pv: string[];
  alternatives: Array<{
    move: string;
    score: number;
  }>;
  isMate?: boolean;
  mateIn?: number;
}

export type MoveClassification = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'brilliant' | 'great' | 'excellent' | 'book' | 'miss';

export interface AnalyzedMove {
  fen: string;
  move: string;
  moveNumber: number;
  playerColor: 'w' | 'b';
  evaluation: StockfishEvaluation;
  classification: MoveClassification;
  comment?: string;
}

// Helper function to format mate scores
export function formatMateScore(score: number): { isMate: boolean; mateIn?: number } {
  // In Stockfish, a mate score is typically represented by large values
  // +- 30000 is often used to represent mate
  const mateThreshold = 9000;
  
  if (Math.abs(score) >= mateThreshold) {
    const mateIn = Math.ceil((30000 - Math.abs(score)) / 2);
    return { isMate: true, mateIn };
  }
  
  return { isMate: false };
}

/**
 * MOCK STOCKFISH SERVICE
 * 
 * This is a simplified mock implementation that simulates Stockfish analysis
 * without actually using the engine. It's useful for development and testing.
 */
export class StockfishService {
  private _isInitialized = false;
  private skill: StockfishLevel = 20;
  private depth: number = 15;

  // Simple initialization - always succeeds
  initialize(): Promise<void> {
    this._isInitialized = true;
    return Promise.resolve();
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  setSkillLevel(level: StockfishLevel): void {
    this.skill = level;
  }

  setDepth(depth: number): void {
    this.depth = depth;
  }

  // Mock analysis that returns predetermined values based on position
  async analyzeFen(fen: string): Promise<StockfishEvaluation> {
    // Create a chess instance to analyze the position
    const chess = new Chess(fen);
    
    // Get all legal moves
    const legalMoves = chess.moves({ verbose: true });
    
    // Check if game is over
    const isGameOver = chess.isGameOver();
    
    // Generate a pseudo-random score based on the position
    // Just for simulation purposes
    const hashFen = this.simpleHash(fen);
    const randomScore = (hashFen % 200 - 100) / 100; // Score between -1.0 and 1.0
    
    // Delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (legalMoves.length === 0 || isGameOver) {
      return {
        bestMove: '',
        score: 0,
        depth: this.depth,
        pv: [],
        alternatives: []
      };
    }
    
    // Pick a "best move" from the legal moves
    const bestMoveIndex = hashFen % legalMoves.length;
    const bestMove = legalMoves[bestMoveIndex];
    
    // Create some alternatives
    const alternatives = legalMoves
      .filter((_, index) => index !== bestMoveIndex)
      .slice(0, 3)
      .map(move => ({
        move: move.san,
        score: randomScore * 0.8 // Slightly worse than "best" move
      }));
    
    return {
      bestMove: bestMove.san,
      score: randomScore,
      depth: this.depth,
      pv: [bestMove.san],
      alternatives
    };
  }

  async getBestMove(fen: string): Promise<string> {
    const evaluation = await this.analyzeFen(fen);
    return evaluation.bestMove;
  }

  async analyzeGame(pgn: string, skillLevel: StockfishLevel = 20, depth: number = 15): Promise<AnalyzedMove[]> {
    this.setSkillLevel(skillLevel);
    this.setDepth(depth);
    
    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
    } catch (error) {
      console.error('Invalid PGN format', error);
      return [];
    }
    
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
      
      // Simulate analysis
      const evaluation = await this.analyzeFen(fen);
      
      // Add a random classification
      const classifications: MoveClassification[] = ['best', 'good', 'inaccuracy', 'mistake', 'blunder', 'brilliant', 'great', 'excellent', 'book', 'miss'];
      const rnd = this.simpleHash(moveData.san + fen) % 100;
      
      let classification: MoveClassification;
      if (rnd < 30) classification = 'best';
      else if (rnd < 60) classification = 'good';
      else if (rnd < 80) classification = 'inaccuracy'; 
      else if (rnd < 95) classification = 'mistake';
      else classification = 'blunder';
      
      // Create analyzed move
      analyzedMoves.push({
        fen,
        move: moveData.san,
        moveNumber,
        playerColor,
        evaluation,
        classification
      });
      
      // Add a small delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return analyzedMoves;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  dispose(): void {
    // Nothing to dispose in the mock implementation
  }
}

// Create a singleton instance
const stockfishService = new StockfishService();
export default stockfishService; 