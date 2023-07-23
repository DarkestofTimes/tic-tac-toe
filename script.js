const gameModule = (function () {
  const grid = [];
  const players = [
    {
      token: "",
    },
    {
      token: "",
    },
  ];

  for (let i = 0; i < 9; i++) {
    grid.push("");
  }

  const markCell = (ev, player) => {
    if (grid[ev] === "") {
      grid[ev] = player;
    }
  };

  const getGrid = () => grid;

  const resetGrid = () => {
    for (let i = 0; i < grid.length; i++) {
      grid[i] = "";
    }
  };

  const setPlayer = (elementId) => {
    players[0].token = elementId;
    players[1].token = elementId === "X" ? "O" : "X";
    return players;
  };

  let currentPlayer = players[0];

  let winner = null;

  let gameOver = false;

  let winningCon = [];

  let clickBlocked = false;

  return {
    markCell,
    getGrid,
    resetGrid,
    setPlayer,
    players,
    currentPlayer,
    winner,
    gameOver,
    winningCon,
    clickBlocked,
  };
})();

function gameMaster() {
  const grid = gameModule;
  const result = resultMaster();
  const display = displayMaster();
  const players = gameModule.players;

  const switchTurn = () => {
    if (!grid.gameOver) {
      gameModule.currentPlayer =
        gameModule.currentPlayer === players[0] ? players[1] : players[0];
      computerPlayer();
    }
  };

  const checkTurn = () => {
    if (players[0].token === "O") {
      switchTurn();
    }
  };

  const gameReset = () => {
    setTimeout(() => {
      grid.resetGrid();
      display.updateDisplay();
      gameModule.currentPlayer = players[0];
      grid.gameOver = false;
      document.querySelector(".gameOverScreen").remove();
      checkTurn();
    }, 1300);
  };

  const playRound = (ev) => {
    if (grid.getGrid()[ev] === "") {
      grid.markCell(ev, gameModule.currentPlayer.token);
      result.getResult();
      display.updateDisplay();
      const gameOver = grid.gameOver;
      if (gameOver && result.getResult() !== null) {
        display.highlight(grid.winningCon);
        display.gameOverDisplay(`${result.getResult()}'s have it!`);
        gameReset();
      } else if (gameOver && result.getResult() === null) {
        display.gameOverDisplay("That would be a tie");
        gameReset();
      }
      switchTurn();
    }
  };

  return {
    playRound,
    getGrid: grid.getGrid,
    setPlayer: grid.setPlayer,
    checkTurn,
  };
}

function resultMaster() {
  const grid = gameModule;
  const winCon = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let winner = null;

  const getResult = () => {
    for (const con of winCon) {
      let [a, b, c] = con.map((index) => grid.getGrid()[index]);

      if (a !== "" && a === b && b === c) {
        grid.gameOver = true;
        winner = a;
        grid.winningCon = con;

        return winner;
      } else if (grid.getGrid().filter((cell) => cell === "").length === 0) {
        grid.gameOver = true;
        winner = null;
        return winner;
      }
    }
  };

  const getWinner = () => winner;

  const getGameOver = () => gameOver;

  const getWinCon = () => winCon;

  return { getResult, getGameOver, getWinner, getWinCon };
}

function displayMaster() {
  const grid = gameModule.getGrid();

  function clickHandler(ev) {
    if (!gameModule.clickBlocked) {
      const game = gameMaster();
      if (ev.target.id) {
        ev.stopPropagation();
        game.playRound(Number(ev.target.id));
        gameModule.clickBlocked = true;
        setTimeout(() => {
          gameModule.clickBlocked = false;
        }, 300);
      } else {
        return;
      }
    }
  }

  const updateDisplay = () => {
    const board = document.querySelector(".grid");
    board.textContent = "";

    grid.forEach((cell, index) => {
      const cells = document.createElement("div");
      cells.classList.add("cellStyle");
      cells.id = index;
      cells.textContent = `${cell}`;
      board.appendChild(cells);
    });

    disableEventListeners();
    addEventListeners();
  };

  const addEventListeners = () => {
    const cells = document.querySelectorAll(".cellStyle");
    cells.forEach((cell) => {
      cell.addEventListener("click", clickHandler);
    });
  };

  const disableEventListeners = () => {
    const listeners = Array.from(document.querySelectorAll(".cellStyle"));
    listeners.forEach((cell) => {
      cell.removeEventListener("click", clickHandler);
    });
  };

  const gameOverDisplay = (result) => {
    const main = document.querySelector("main");
    const gameOverScreen = `
      <div class="gameOverScreen">
        <div class="gameOverTable">
        <h2 class="announceWinner"></h2>
        </div>
      </div>`;
    setTimeout(() => {
      main.insertAdjacentHTML("afterend", gameOverScreen);
      document.querySelector(".announceWinner").textContent = result;
    }, 500);
  };

  const highlight = (a) => {
    a.forEach((b) => {
      const cell = document.getElementById(b);
      cell.classList.add("highlightRED");
    });
  };

  return { updateDisplay, disableEventListeners, gameOverDisplay, highlight };
}

function assignPlayers() {
  const grid = gameModule;
  const game = gameMaster();
  const main = document.querySelector("main");
  const popUp = `
      <div class="popUpContainer">
        <div class="popUpTable">
          <button id="X" class="popUpButton">X</button>
          <button id="O" class="popUpButton">O</button>
        </div>
      </div>`;

  main.insertAdjacentHTML("afterend", popUp);

  const buttons = document.querySelectorAll(".popUpButton");
  buttons.forEach((button) => {
    button.addEventListener("click", (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      const elementId = ev.target.id;
      grid.setPlayer(elementId);
      game.checkTurn();
      document.querySelector(".popUpContainer").style.display = "none";
    });
  });
}

function computerPlayer() {
  const grid = gameModule.getGrid();
  const players = gameModule.players;
  const currentPlayer = gameModule.currentPlayer;
  const game = gameMaster();
  const scores = {
    computer: 10,
    player: -10,
    tie: 0,
  };
  const winCon = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const getResultCopy = (gridCopy) => {
    for (const con of winCon) {
      let [a, b, c] = con.map((index) => gridCopy[index]);

      if (a !== "" && a === b && b === c) {
        return gridCopy[con[0]] === players[0].token
          ? scores.player
          : scores.computer;
      }
    }

    return gridCopy.includes("") ? null : scores.tie;
  };

  if (currentPlayer === players[1]) {
    const newGrid = grid.filter((cell) => cell === "");
    let bestScore = -Infinity;
    let bestMove;
    for (let index = 0; index < newGrid.length; index++) {
      if (newGrid[index] === "") {
        let { moves, score } = minimax(grid, 0, true);
        if (score > bestScore) {
          bestScore = score;
          bestMove = moves.index;
        }
      }
    }
    game.playRound(bestMove);
  }

  function minimax(grid, depth, isMaximizing) {
    const result = getResultCopy(grid);
    if (result === scores.computer) {
      return { score: scores.computer };
    } else if (result === scores.tie) {
      return { score: scores.tie };
    } else if (result === scores.player) {
      return { score: scores.player };
    } else if (result === null) {
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      let move = [];
      let bestMove = [];
      for (let index = 0; index < grid.length; index++) {
        if (grid[index] === "") {
          grid[index] = players[1].token;
          let { moves, score } = minimax(grid, depth + 1, false);
          grid[index] = "";
          if (score > bestScore) {
            bestScore = score;
            score = Math.sign(score) * (Math.abs(score) - 1);
            move.push({ index, score });
            bestMove = move.sort((a, b) => b.score - a.score)[0];
          }
        }
      }
      return { moves: bestMove, score: bestScore };
    } else {
      let bestScore = Infinity;
      let move = [];
      let bestMove = [];
      for (let index = 0; index < grid.length; index++) {
        if (grid[index] === "") {
          grid[index] = players[0].token;
          let { moves, score } = minimax(grid, depth + 1, true);
          grid[index] = "";
          if (score < bestScore) {
            bestScore = score;
            score = Math.sign(score) * (Math.abs(score) - 1);
            move.push({ index, score });
            bestMove = move.sort((a, b) => b.score - a.score)[0];
          }
        }
      }

      return { moves: bestMove, score: bestScore };
    }
  }
}

function initializeGame() {
  const display = displayMaster();
  display.updateDisplay();
  assignPlayers();
}

initializeGame();
