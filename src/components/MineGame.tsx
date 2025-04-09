import { useState, useEffect, useCallback } from 'react'
import './MineGame.css'

interface GameStats {
  wins: number;
  losses: number;
  totalProfit: number;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

// UPI Payment interface
interface UPIPayment {
  isOpen: boolean;
  mode: 'deposit' | 'withdraw';
  amount: number;
  upiId: string;
  transactionId?: string;
  status?: 'pending' | 'completed' | 'failed';
}

const MineGame = () => {
  const gridSize = 5; // 5x5 grid = 25 cells
  const [mines, setMines] = useState<number[]>([]);
  const [revealedCells, setRevealedCells] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(5);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [currentPayout, setCurrentPayout] = useState(0);
  const [balance, setBalance] = useState(10); // Starting balance
  const [gameStats, setGameStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    totalProfit: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [lastRevealed, setLastRevealed] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  // UPI payment state
  const [upiPayment, setUpiPayment] = useState<UPIPayment>({
    isOpen: false,
    mode: 'deposit',
    amount: 10,
    upiId: ''
  });

  // Add notification
  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { message, type, id }]);
    
    // Auto remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 3000);
  };

  // Calculate theoretical payout based on current state
  useEffect(() => {
    if (revealedCells.length === 0) {
      setCurrentMultiplier(1);
      setCurrentPayout(0);
      return;
    }

    // Multiplier calculation formula (similar to Stake's mines game)
    const safeSquares = gridSize * gridSize - mineCount;
    const openedSafeTiles = revealedCells.length;
    
    // House edge of 1%
    const houseEdge = 0.99;
    
    // Theoretical multiplier formula - improved calculation
    let multiplier = 1;
    let remainingTiles = gridSize * gridSize;
    let remainingSafeTiles = safeSquares;
    
    for (let i = 0; i < openedSafeTiles; i++) {
      // For each click, calculate the probability of hitting a safe tile
      const probability = remainingSafeTiles / remainingTiles;
      multiplier = multiplier * (1 / probability);
      
      // Reduce the count of remaining tiles and safe tiles
      remainingTiles--;
      remainingSafeTiles--;
    }
    
    // Apply house edge
    multiplier = multiplier * houseEdge;
    
    setCurrentMultiplier(Number(multiplier.toFixed(2)));
    setCurrentPayout(Number((betAmount * multiplier).toFixed(2)));
  }, [revealedCells, mineCount, betAmount, gridSize]);

  // Place mines randomly on the grid
  const placeMines = useCallback(() => {
    const minePositions: number[] = [];
    while (minePositions.length < mineCount) {
      const position = Math.floor(Math.random() * (gridSize * gridSize));
      if (!minePositions.includes(position)) {
        minePositions.push(position);
      }
    }
    setMines(minePositions);
  }, [mineCount, gridSize]);

  // Start a new game
  const startGame = () => {
    if (betAmount > balance) {
      addNotification("Insufficient balance. You don't have enough funds to place this bet.", 'error');
      return;
    }

    // Check minimum bet amount for real money
    if (betAmount < 10) {
      addNotification("Minimum bet amount is ₹10 for real money games.", 'error');
      return;
    }

    setBalance(prev => prev - betAmount);
    setRevealedCells([]);
    setGameOver(false);
    setIsWinner(false);
    setLastRevealed(null);
    placeMines();
    addNotification(`Game started with ${mineCount} mines. Good luck!`, 'info');
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (gameOver || revealedCells.includes(index) || !mines.length || isRevealing) {
      return;
    }

    setIsRevealing(true);
    setLastRevealed(index);

    // Add a slight delay for the animation effect
    setTimeout(() => {
      if (mines.includes(index)) {
        // Hit a mine, game over
        setGameOver(true);
        setIsWinner(false);
        setRevealedCells(prev => [...prev, index]);
        
        // Update stats
        setGameStats(prev => ({
          ...prev,
          losses: prev.losses + 1,
          totalProfit: prev.totalProfit - betAmount
        }));
        
        addNotification(`Boom! Game Over. You hit a mine and lost ₹${betAmount.toFixed(2)}.`, 'error');
      } else {
        // Reveal a safe cell
        const newRevealedCells = [...revealedCells, index];
        setRevealedCells(newRevealedCells);
        
        // Check if all safe cells are revealed (win condition)
        const safeSquares = gridSize * gridSize - mineCount;
        if (newRevealedCells.length === safeSquares) {
          setGameOver(true);
          setIsWinner(true);
          
          // Calculate final multiplier (for accurate win amount)
          let finalMultiplier = 1;
          let remainingTiles = gridSize * gridSize;
          let remainingSafeTiles = safeSquares;
          
          for (let i = 0; i < safeSquares; i++) {
            const probability = remainingSafeTiles / remainingTiles;
            finalMultiplier = finalMultiplier * (1 / probability);
            remainingTiles--;
            remainingSafeTiles--;
          }
          
          // Apply house edge
          finalMultiplier = finalMultiplier * 0.99;
          
          // Update balance and stats with accurate multiplier
          const winAmount = betAmount * finalMultiplier;
          setCurrentMultiplier(Number(finalMultiplier.toFixed(2)));
          setCurrentPayout(Number(winAmount.toFixed(2)));
          setBalance(prev => prev + winAmount);
          setGameStats(prev => ({
            ...prev,
            wins: prev.wins + 1,
            totalProfit: prev.totalProfit + (winAmount - betAmount)
          }));
          
          addNotification(`Congratulations! You won ₹${winAmount.toFixed(2)}!`, 'success');
        }
      }

      setIsRevealing(false);
    }, 300);
  };

  // Cash out current winnings
  const cashOut = () => {
    if (gameOver || !mines.length || revealedCells.length === 0 || isRevealing) {
      return;
    }

    setGameOver(true);
    setIsWinner(true);
    
    // Use the current multiplier and payout values which are already calculated
    const winAmount = currentPayout;
    setBalance(prev => prev + winAmount);
    setGameStats(prev => ({
      ...prev,
      wins: prev.wins + 1,
      totalProfit: prev.totalProfit + (winAmount - betAmount)
    }));
    
    addNotification(`Cashed Out! You won ₹${winAmount.toFixed(2)} with a ${currentMultiplier.toFixed(2)}x multiplier!`, 'success');
  };

  // Generate the grid cells
  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const isRevealed = revealedCells.includes(i);
      const isMine = mines.includes(i) && (isRevealed || gameOver);
      const isLastRevealed = lastRevealed === i;
      const isHovered = hoveredCell === i;
      
      const cellClass = `mine-cell ${isMine ? "mine" : ""} ${isRevealed ? "revealed" : ""} ${isLastRevealed ? "last-revealed" : ""} ${isHovered && !isRevealed && !gameOver ? "hovered" : ""}`;
      
      cells.push(
        <div 
          key={i}
          className={cellClass}
          onClick={() => handleCellClick(i)}
          onMouseEnter={() => setHoveredCell(i)}
          onMouseLeave={() => setHoveredCell(null)}
          onTouchStart={() => setHoveredCell(i)}
          onTouchEnd={() => setHoveredCell(null)}
        >
          {isMine ? "💣" : isRevealed ? "✓" : ""}
          <div className="cell-glow"></div>
        </div>
      );
    }
    return cells;
  };

  // Render notifications
  const renderNotifications = () => {
    return (
      <div className="notification-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type}`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    );
  };

  // Format number with a plus sign if positive
  const formatNumber = (num: number) => {
    return num > 0 ? `+₹${num.toFixed(2)}` : `₹${num.toFixed(2)}`;
  };

  // Open UPI payment modal
  const openUpiPayment = (mode: 'deposit' | 'withdraw') => {
    setUpiPayment({
      isOpen: true,
      mode,
      amount: 10,
      upiId: ''
    });
  };

  // Close UPI payment modal
  const closeUpiPayment = () => {
    setUpiPayment(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Handle UPI payment submission
  const handleUpiPayment = () => {
    if (!upiPayment.upiId) {
      addNotification('Please enter a valid UPI ID', 'error');
      return;
    }

    if (upiPayment.amount <= 0) {
      addNotification('Please enter a valid amount', 'error');
      return;
    }

    if (upiPayment.mode === 'withdraw' && upiPayment.amount > balance) {
      addNotification('Insufficient balance for withdrawal', 'error');
      return;
    }

    // Generate a unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Set transaction to pending status
    setUpiPayment(prev => ({
      ...prev,
      status: 'pending',
      transactionId
    }));

    addNotification(`Initiating ${upiPayment.mode === 'deposit' ? 'deposit' : 'withdrawal'} transaction...`, 'info');

    // In a real implementation, this would connect to a payment gateway API
    // For now, we'll simulate the API call with a timeout
    setTimeout(() => {
      if (upiPayment.mode === 'deposit') {
        // Process deposit transaction
        setBalance(prev => prev + upiPayment.amount);
        addNotification(
          `Successfully deposited ₹${upiPayment.amount} through UPI (ID: ${transactionId})`, 
          'success'
        );
      } else {
        // Process withdrawal transaction
        setBalance(prev => prev - upiPayment.amount);
        addNotification(
          `Successfully withdrew ₹${upiPayment.amount} to UPI ID ${upiPayment.upiId} (ID: ${transactionId})`, 
          'success'
        );
      }

      // Update transaction status
      setUpiPayment(prev => ({
        ...prev,
        status: 'completed'
      }));

      // Log transaction for backend
      console.log('Transaction completed:', {
        id: transactionId,
        type: upiPayment.mode,
        amount: upiPayment.amount,
        upiId: upiPayment.upiId,
        timestamp: new Date().toISOString()
      });

      closeUpiPayment();
    }, 2000); // Simulate 2-second processing time
  };

  // Render UPI payment modal
  const renderUpiPaymentModal = () => {
    if (!upiPayment.isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>{upiPayment.mode === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}</h3>
          
          {upiPayment.status === 'pending' ? (
            <div className="transaction-pending">
              <div className="spinner"></div>
              <p>Processing your transaction...</p>
              <p className="transaction-id">ID: {upiPayment.transactionId}</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>
                  Amount (₹):
                  <input 
                    type="number" 
                    min="1" 
                    value={upiPayment.amount}
                    onChange={(e) => setUpiPayment(prev => ({
                      ...prev,
                      amount: Number(e.target.value)
                    }))}
                  />
                </label>
              </div>
              
              <div className="form-group">
                <label>
                  UPI ID:
                  <input 
                    type="text" 
                    placeholder="yourname@upi"
                    value={upiPayment.upiId}
                    onChange={(e) => setUpiPayment(prev => ({
                      ...prev,
                      upiId: e.target.value
                    }))}
                  />
                </label>
              </div>
              
              <div className="payment-disclaimer">
                <p>By proceeding, you agree to our payment terms and conditions.</p>
              </div>
              
              <div className="modal-actions">
                <button className="cancel-button" onClick={closeUpiPayment}>Cancel</button>
                <button className="confirm-button" onClick={handleUpiPayment}>
                  {upiPayment.mode === 'deposit' ? 'Deposit Now' : 'Withdraw Now'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mine-game">
      {renderNotifications()}
      {renderUpiPaymentModal()}
      <div className="game-container">
        <div className="game-controls">
          <div className="control-panel">
            <h3>Balance: <span className="highlight">{balance.toFixed(2)}</span></h3>
            
            <div className="payment-actions">
              <button 
                className="payment-button deposit-button"
                onClick={() => openUpiPayment('deposit')}
              >
                Deposit
              </button>
              <button 
                className="payment-button withdraw-button"
                onClick={() => openUpiPayment('withdraw')}
                disabled={balance <= 0}
              >
                Withdraw
              </button>
            </div>
            
            <div className="control-group">
              <label>
                Bet Amount: ₹{betAmount.toFixed(2)}
                <input 
                  type="range" 
                  min="10" 
                  max="1000" 
                  step="10"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={mines.length > 0 && !gameOver}
                />
              </label>
            </div>
            
            <div className="control-group">
              <label>
                Mines: {mineCount}
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  value={mineCount}
                  onChange={(e) => setMineCount(Number(e.target.value))}
                  disabled={mines.length > 0 && !gameOver}
                />
              </label>
            </div>
          </div>
          
          <div className="stats-panel">
            <h3>Game Stats</h3>
            <p>Wins: <span className="stat-value">{gameStats.wins}</span></p>
            <p>Losses: <span className="stat-value">{gameStats.losses}</span></p>
            <p>Profit: <span className={`stat-value ${gameStats.totalProfit >= 0 ? "positive" : "negative"}`}>
              {formatNumber(gameStats.totalProfit)}
            </span></p>
          </div>
          
          <button 
            className="game-button start-button"
            onClick={startGame}
            disabled={betAmount > balance || isRevealing}
          >
            {mines.length > 0 && !gameOver ? "New Game" : "Start Game"}
          </button>
          
          {mines.length > 0 && !gameOver && revealedCells.length > 0 && (
            <button 
              className="game-button cashout-button"
              onClick={cashOut}
              disabled={isRevealing}
            >
              Cash Out ₹{currentPayout.toFixed(2)}
            </button>
          )}
        </div>
        
        <div className="game-board">
          <div className="payout-info">
            <div>
              <p className="info-label">Multiplier</p>
              <p className="info-value">{currentMultiplier.toFixed(2)}x</p>
            </div>
            <div>
              <p className="info-label">Potential Payout</p>
              <p className="info-value">₹{currentPayout.toFixed(2)}</p>
            </div>
            <div>
              <p className="info-label">Safe Cells</p>
              <p className="info-value">{revealedCells.length}/{gridSize * gridSize - mineCount}</p>
            </div>
          </div>
          
          <div className={`mine-grid ${isRevealing ? "revealing" : ""} ${gameOver ? (isWinner ? "winner" : "loser") : ""}`}>
            {renderGrid()}
          </div>
          
          {gameOver && (
            <div className={`game-result ${isWinner ? "win" : "lose"}`}>
              {isWinner ? 
                `You won ₹${currentPayout.toFixed(2)} with a ${currentMultiplier.toFixed(2)}x multiplier!` : 
                `Game over! You lost ₹${betAmount.toFixed(2)}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MineGame; 