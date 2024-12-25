// Select DOM elements
const board = document.getElementById('board');
const message = document.getElementById('message');
const resetButton = document.getElementById('reset-button');

// Game state variables
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;

// Winning combinations
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Initialize the board
function initializeBoard() {
    board.innerHTML = '';
    gameBoard.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.index = index;
        cellElement.addEventListener('click', handleCellClick);
        board.appendChild(cellElement);
    });
    updateMessage(`Player ${currentPlayer}'s turn`);
}

// Handle cell click
function handleCellClick(event) {
    const cellIndex = event.target.dataset.index;

    if (gameBoard[cellIndex] !== '' || !isGameActive) {
        return;
    }

    updateCell(event.target, cellIndex);
    checkGameResult();
}

// Update cell
function updateCell(cell, index) {
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add('taken');
}

// Check game result
function checkGameResult() {
    let roundWon = false;
    let winningCells = [];

    // Check for a winning combination
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (
            gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c]
        ) {
            roundWon = true;
            winningCells = [a, b, c]; // Store the indices of winning cells
            break;
        }
    }

    if (roundWon) {
        highlightWinningCells(winningCells);
        updateMessage(`Player ${currentPlayer} wins!`);
        isGameActive = false;
    } else if (!gameBoard.includes('')) {
        updateMessage(`It's a draw!`);
        isGameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateMessage(`Player ${currentPlayer}'s turn`);
    }
}

// Highlight winning cells
function highlightWinningCells(cells) {
    cells.forEach(index => {
        const cellElement = board.children[index];
        cellElement.classList.add('winning-cell');
    });
}


// Update message
function updateMessage(msg) {
    message.textContent = msg;
}

// Reset game
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    initializeBoard();
    // Remove winning-cell class
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('winning-cell'));
}

const aiToggle = document.getElementById('ai-toggle'); // Checkbox to enable AI

// Check if the game is against AI
function isAgainstAI() {
    return aiToggle.checked;
}

// AI makes a move
function aiMove() {
    if (!isGameActive) return;

    const bestMove = getBestMove();
    if (bestMove !== null) {
        gameBoard[bestMove] = 'O';
        const cellElement = board.children[bestMove];
        cellElement.textContent = 'O';
        cellElement.classList.add('taken');
        checkGameResult();
    }
}

// Get the best move using minimax
function getBestMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O'; // AI makes a tentative move
            let score = minimax(gameBoard, 0, false);
            gameBoard[i] = ''; // Undo the tentative move

            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    const result = checkWinner(board);
    if (result !== null) {
        if (result === 'X') return -10 + depth; // Penalize for deeper losses
        if (result === 'O') return 10 - depth;  // Reward faster wins
        if (result === 'draw') return 0;       // Neutral score for draw
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check winner for minimax
function checkWinner(board) {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return board.includes('') ? null : 'draw'; // Return 'draw' if no empty spaces
}

// Handle player moves and trigger AI if enabled
function handleCellClick(event) {
    const cellIndex = event.target.dataset.index;

    if (gameBoard[cellIndex] !== '' || !isGameActive) {
        return;
    }

    updateCell(event.target, cellIndex);
    checkGameResult();

    // Trigger AI move if against AI and game is active
    if (isAgainstAI() && isGameActive && currentPlayer === 'O') {
        setTimeout(aiMove, 500); // Add a delay for realism
    }
}

// Update the cell
function updateCell(cell, index) {
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add('taken');
}


// Event listeners
resetButton.addEventListener('click', resetGame);

// Initialize the game on page load
initializeBoard();
