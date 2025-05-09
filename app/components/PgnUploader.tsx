'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, RotateCw, ChevronRight, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { StockfishLevel } from '../lib/stockfish/stockfish-service';
import Image from 'next/image';

interface PgnUploaderProps {
  onPgnSubmit: (pgn: string, engineLevel: StockfishLevel) => void;
}

// Sample PGN from a famous game (Fischer vs Spassky, 1972)
const SAMPLE_PGN = `[Event "World Championship 29th"]
[Site "Reykjavik"]
[Date "1972.07.23"]
[Round "6"]
[White "Fischer, Robert James"]
[Black "Spassky, Boris Vasilievich"]
[Result "1-0"]
[ECO "D59"]
[WhiteElo "2785"]
[BlackElo "2660"]
[PlyCount "81"]

1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5
Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6
15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21.
f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7
28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2
Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8
41. Qf4 1-0`;

export default function PgnUploader({ onPgnSubmit }: PgnUploaderProps) {
  const [pgnText, setPgnText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [engineLevel, setEngineLevel] = useState<StockfishLevel>(20);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPgnText(content);
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pgnText.trim()) {
      onPgnSubmit(pgnText.trim(), engineLevel);
    }
  };
  
  const loadSamplePgn = () => {
    setPgnText(SAMPLE_PGN);
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith('.pgn')) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPgnText(content);
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-xl border-0 overflow-hidden animate-fadeIn">
      {/* Header with subtle background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 py-5 px-6 border-b">
        <p className="text-center text-gray-600 dark:text-gray-300 font-medium">
          Upload or paste your chess game PGN to get an in-depth analysis powered by Stockfish
        </p>
      </div>

      {/* Engine Settings Section - Placed at the top, clearly visible */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Engine Settings</h3>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Engine Strength</span>
          <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md">
            Level {engineLevel}
          </span>
        </div>
        
        <Slider
          defaultValue={[engineLevel]}
          max={20}
          min={1}
          step={1}
          onValueChange={(values) => setEngineLevel(values[0] as StockfishLevel)}
          className="py-1"
        />
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Master</span>
        </div>
      </div>

      <div className="p-0">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row">
          {/* Left side - Drag & Drop Area */}
          <div className="md:w-1/3 p-5 border-r border-gray-200 dark:border-gray-700">
            <div
              className={`border-2 border-dashed rounded-lg p-5 text-center transition-all duration-200 ease-in-out h-full flex flex-col justify-center
                ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
                ${isLoading ? 'opacity-50' : 'hover:border-blue-400 dark:hover:border-blue-600'}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                id="pgn-file"
                type="file"
                accept=".pgn"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center py-6">
                <div className="mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                  <svg
                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Drag & drop your PGN file here
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  or
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('pgn-file')?.click()}
                  className="flex items-center gap-2 px-4 py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Browse Files</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right side - Paste PGN & Instructions */}
          <div className="md:w-2/3 p-5">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="pgn-textarea" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Or paste your PGN notation:
                </label>
                <button 
                  type="button"
                  onClick={loadSamplePgn}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  Load sample game
                </button>
              </div>
              <Textarea
                id="pgn-textarea"
                placeholder="Paste your PGN notation here..."
                className="min-h-40 font-mono text-sm resize-y p-3 focus-visible:ring-blue-500"
                value={pgnText}
                onChange={(e) => setPgnText(e.target.value)}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {pgnText ? `${pgnText.length} characters` : 'Empty'}
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">How to get your PGN</h4>
              <ul className="text-xs text-blue-700 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>From Chess.com: Go to Game Archive → Select a game → Share → Download PGN</li>
                <li>From Lichess: Open a game → Menu → Download → PGN</li>
                <li>From other sites: Look for download or export options in game menus</li>
              </ul>
            </div>

            <div className="mt-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all py-6"
                disabled={!pgnText.trim() || isLoading}
                onClick={handleSubmit}
              >
                <span className="mr-2 text-base">
                  Analyze Game with Level {engineLevel} Engine
                </span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
} 