# Chess Game Analysis with Stockfish

**🚀 [Try the Live App Here](https://chess-analyzer-v7uy.onrender.com)** 

A web application that allows users to analyze their Chess.com games using the Stockfish chess engine. The app provides detailed move analysis, accuracy scores, and identifies critical moments in the game.

## Features

- Paste or upload PGN files from Chess.com games
- Real-time Stockfish analysis
- Interactive chess board to review moves
- Detailed analysis of each move (best moves, mistakes, blunders)
- Game summary with accuracy scores and critical moments
- Adjustable Stockfish skill level

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: Tailwind CSS, shadcn/ui
- **Chess Libraries**: chess.js, react-chessboard
- **Engine**: Stockfish (WASM)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/anujayghosh/chess-analyzer.git
cd chess-analysis
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## Deployment on Render

This application is deployed and available at: **[https://chess-analyzer-v7uy.onrender.com](https://chess-analyzer-v7uy.onrender.com)**

This application is configured for easy deployment on Render.com.

1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Use the following settings:
   - **Name**: chess-analysis (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

## How to Use

1. Paste a PGN from Chess.com or upload a PGN file.
2. Click "Analyze Game" to start the Stockfish analysis.
3. Once analysis is complete, navigate through moves using the chess board controls.
4. View detailed analysis for each move and an overall game summary.
5. Adjust the Stockfish skill level using the slider if needed.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Attribution Requirements

If you use this codebase or parts of it in your own projects, please include the following attribution:

```
Chess Analyzer - Originally created by Anujay Ghosh
https://github.com/anujayghosh/chess-analyzer
```

## Acknowledgements

- [Stockfish](https://stockfishchess.org/) - The powerful open-source chess engine
- [chess.js](https://github.com/jhlywa/chess.js) - A JavaScript chess library for chess move generation/validation
- [react-chessboard](https://github.com/Clariity/react-chessboard) - A chessboard component for React
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible UI components

## Support

For issues, feature requests, or questions, please open an issue on GitHub.
