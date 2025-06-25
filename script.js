function generateBoard() {
  const board = document.getElementById("sudoku-board");
  board.innerHTML = "";
  for (let i = 0; i < 81; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = "1";
    input.dataset.index = i;
    input.value = Math.random() < 0.2 ? Math.floor(Math.random() * 9 + 1) : "";
    input.oninput = () => {
      input.value = input.value.replace(/[^1-9]/g, "");
    };
    board.appendChild(input);
  }
}

function getBoard() {
  const inputs = document.querySelectorAll("#sudoku-board input");
  let board = [];
  for (let i = 0; i < 9; i++) {
    board.push([]);
    for (let j = 0; j < 9; j++) {
      const val = inputs[i * 9 + j].value;
      board[i].push(val === "" ? 0 : parseInt(val));
    }
  }
  return board;
}

function setBoard(board) {
  const inputs = document.querySelectorAll("#sudoku-board input");
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      inputs[i * 9 + j].value = board[i][j] === 0 ? "" : board[i][j];
    }
  }
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + i % 3;
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
}

function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function solveBoard() {
  const board = getBoard();
  if (solveSudoku(board)) {
    setBoard(board);
    alert("Solved!");
  } else {
    alert("No solution found.");
  }
}

generateBoard();
