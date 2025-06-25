let lives = 3;

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + i % 3;
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
}

function solve(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = [...Array(9).keys()].map(i => i + 1).sort(() => Math.random() - 0.5);
        for (let num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function getCluesFromDifficulty() {
  const level = document.getElementById("difficulty").value;
  if (level === "easy") return 45;
  if (level === "hard") return 25;
  return 30;
}

function generatePuzzle(clues = 30) {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(board);
  const solution = board.map(row => [...row]); // שמור את הפתרון האמיתי

  const positions = [];
  for (let i = 0; i < 81; i++) positions.push(i);
  positions.sort(() => Math.random() - 0.5);

  const removed = 81 - clues;
  for (let i = 0; i < removed; i++) {
    const row = Math.floor(positions[i] / 9);
    const col = positions[i] % 9;
    board[row][col] = 0;
  }

  return { puzzle: board, solution };
}

function generateBoard() {
  const boardElement = document.getElementById("sudoku-board");
  boardElement.innerHTML = "";
  lives = 3;
  updateHearts();

  const clues = getCluesFromDifficulty();
  const { puzzle, solution } = generatePuzzle(clues);

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = "1";
      input.dataset.row = i;
      input.dataset.col = j;

      if (puzzle[i][j] !== 0) {
        input.value = puzzle[i][j];
        input.disabled = true;
        input.style.backgroundColor = "#e0e0e0";
      } else {
        input.value = "";
        input.oninput = () => {
          if (lives <= 0) {
            input.value = "";
            return;
          }
          const val = input.value.replace(/[^1-9]/g, "");
          input.value = val;

          if (val) {
            const correct = solution[i][j];
            if (parseInt(val) !== correct) {
              lives--;
              updateHearts();
              input.value = "";
              alert("לא נכון! ירד לך לב ❤️");
              if (lives === 0) {
                alert("המשחק נגמר 😭");
                disableBoard();
              }
            }
          }
        };
      }

      boardElement.appendChild(input);
    }
  }
}

function updateHearts() {
  const heartDisplay = document.getElementById("hearts");
  heartDisplay.innerText = "❤️".repeat(lives) + "💔".repeat(3 - lives);
}

function disableBoard() {
  document.querySelectorAll("#sudoku-board input").forEach(input => {
    if (!input.disabled) input.disabled = true;
  });
}

generateBoard();
