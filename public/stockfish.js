/**
 * Stockfish Web Worker
 * 
 * This is a minimal web worker wrapper for a mock Stockfish engine.
 */

// Simple mock implementation for web worker
self.onmessage = function(event) {
  // Echo back the command with a simulated response
  const command = event.data;
  
  // For position and go commands, respond with a bestmove
  if (command.startsWith('position') || command.startsWith('go')) {
    setTimeout(() => {
      self.postMessage('bestmove e2e4');
    }, 100);
  } 
  // For isready command
  else if (command === 'isready') {
    self.postMessage('readyok');
  }
  // For uci command
  else if (command === 'uci') {
    self.postMessage('uciok');
  }
  // For other commands, just acknowledge
  else {
    self.postMessage('ok');
  }
}; 