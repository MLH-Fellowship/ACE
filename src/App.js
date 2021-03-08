import React from 'react';
import ChessGame from './chess/UI/chessgame';

import StockFish from "./integrations/stockfish";
function App() {
  return (
    <div className="check">
      <StockFish>
      {({ position, onDrop, game }) => (
        <ChessGame game={game} color={true} position={position} onDrop={onDrop}/>
      )}
      </StockFish>
    </div>
  );
}

export default App;
