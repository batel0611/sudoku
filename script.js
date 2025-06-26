let lives = 3;
let currentBoard = [];
let solution = [];
let startTime;
let timerInterval;
let username = "";
let theme = "default";

function isRelaxedMode() {
  return document.getElementById("mode").value === "no-lives";
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
  solution = board.map(row => [...row]);
  const puzzle = solution.map(row => [...row]);
  const positions = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  const removed = 81 - clues;
  for (let i = 0; i < removed; i++) {
    const row = Math.floor(positions[i] / 9);
    const col = positions[i] % 9;
    puzzle[row][col] = 0;
  }
  return puzzle;
}

function generateBoard() {
  const boardElement = document.getElementById("sudoku-board");
  const numbersBar = document.getElementById("numbers-bar");
  boardElement.innerHTML = "";
  numbersBar.innerHTML = "";

  lives = isRelaxedMode() ? Infinity : 3;
  updateHearts();
  document.getElementById("win-message").style.display = "none";
  startTimer();

  const clues = getCluesFromDifficulty();
  const puzzle = generatePuzzle(clues);
  currentBoard = puzzle.map(row => [...row]);

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
        input.classList.add("fixed");
      } else {
        input.value = "";
        input.oninput = () => handleInput(input, i, j);
      }
      boardElement.appendChild(input);
    }
  }

  for (let num = 1; num <= 9; num++) {
  const btn = document.createElement("button");
  btn.textContent = num;
  btn.dataset.number = num;
  btn.onclick = () => {
    highlightNumber(num);
    btn.classList.add("bounce");
    setTimeout(() => btn.classList.remove("bounce"), 300);
  };
  numbersBar.appendChild(btn);
}

}

function handleInput(input, i, j) {
  if (!isRelaxedMode() && lives <= 0) return;
  const val = input.value.replace(/[^1-9]/g, "");
  input.value = val;
  
  input.classList.add("flash");
  setTimeout(() => input.classList.remove("flash"), 300);


  if (val) {
    const userNum = parseInt(val);
    const correct = solution[i][j];
    currentBoard[i][j] = userNum;

    if (userNum !== correct) {
      if (!isRelaxedMode()) {
        lives--;
        updateHearts();
        input.value = "";
        currentBoard[i][j] = 0;
        alert("לא נכון! ירד לך לב ❤️");
        if (lives === 0) {
          alert("המשחק נגמר 😭");
          disableBoard();
          stopTimer();
        }
      }
    } else {
      updateNumbersBar();
    }

    if (checkWin()) {
      stopTimer();
      const duration = document.getElementById("timer").textContent;
      saveScore(username, duration);
      document.getElementById("win-message").style.display = "block";
      document.getElementById("win-sound").play();
      disableBoard();
    } else if (isRelaxedMode() && isBoardFull()) {
      alert("יש טעויות בלוח 😥");
    }
  }
}

function updateHearts() {
  const heartDisplay = document.getElementById("hearts");
  heartDisplay.innerText = isRelaxedMode() ? "♾️ מצב רגוע" : "❤️".repeat(lives) + "💔".repeat(3 - lives);
}

function disableBoard() {
  document.querySelectorAll("#sudoku-board input").forEach(input => {
    if (!input.disabled) input.disabled = true;
  });
}

function checkWin() {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const input = document.querySelector(`input[data-row='${row}'][data-col='${col}']`);
      const val = parseInt(input.value);
      if (!val || val !== solution[row][col]) return false;
    }
  }
  return true;
}

function isBoardFull() {
  return [...document.querySelectorAll("#sudoku-board input")].every(input => input.value !== "");
}

function highlightNumber(num) {
  document.querySelectorAll("#sudoku-board input").forEach(input => {
    if (input.value == num) {
      input.style.backgroundColor = "#ffeb3b";
    } else if (!input.disabled) {
      input.style.backgroundColor = "white";
    } else {
      input.style.backgroundColor = "#e0e0e0";
    }
  });
}

function updateNumbersBar() {
  for (let n = 1; n <= 9; n++) {
    const count = [...document.querySelectorAll("#sudoku-board input")].filter(
      el => parseInt(el.value) === n
    ).length;
    if (count === 9) {
      const btn = document.querySelector(`#numbers-bar button[data-number='${n}']`);
      if (btn) btn.remove();
    }
  }
}

function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const now = Date.now();
    const diff = now - startTime;
    const totalSeconds = Math.floor(diff / 1000);

    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");

    document.getElementById("timer").textContent = `${hours}:${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function saveScore(user, time) {
  if (!user) return;
  let scores = JSON.parse(localStorage.getItem("sudoku-scores")) || [];
  scores.push({ user, time, date: new Date().toISOString() });
  localStorage.setItem("sudoku-scores", JSON.stringify(scores));
}

// ✅ קוד הפעלה ראשוני של המשחק והתפריט
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-button");
  if (startBtn) {
    startBtn.onclick = () => {
      const nameInput = document.getElementById("player-name");
      username = nameInput && nameInput.value.trim() !== "" ? nameInput.value.trim() : "שחקן";

      const difficulty = document.getElementById("start-difficulty").value;
      const mode = document.getElementById("start-mode").value;
      document.getElementById("difficulty").value = difficulty;
      document.getElementById("mode").value = mode;

      document.getElementById("start-screen").style.display = "none";
      document.getElementById("game-screen").style.display = "block";
      generateBoard();
    };
  }

  // תפריט ⋮ שינוי עיצוב
  const menuToggle = document.getElementById("menu-toggle");
  const themeMenu = document.getElementById("theme-menu");
  if (menuToggle && themeMenu) {
    menuToggle.onclick = () => {
      themeMenu.classList.toggle("hidden");
    };
  }

  const themeSelect = document.getElementById("theme-select");
  if (themeSelect) {
    themeSelect.onchange = (e) => {
      document.body.className = "theme-" + e.target.value;
    };
  }

  loadHighScores();
});

function loadHighScores() {
  fetch("/api/highscores")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("highscore-list");
      list.innerHTML = "";
      data.forEach(score => {
        const li = document.createElement("li");
        li.textContent = `🏅 ${score.name} - ${score.time}`;
        list.appendChild(li);
      });
    });
}
