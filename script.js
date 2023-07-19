const gameModule = (function () {
  const grid = [];
  const listeners = [];
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

  return {
    markCell,
    getGrid,
    resetGrid,
    setPlayer,
    players,
    currentPlayer,
    listeners,
    winner,
  };
})();

function gameMaster() {
  const grid = gameModule;
  const result = resultMaster();
  const display = displayMaster();
  const players = gameModule.players;

  const switchTurn = () => {
    if (!result.gameOver) {
      gameModule.currentPlayer =
        gameModule.currentPlayer === players[0] ? players[1] : players[0];
      computerPlayer();
    }
  };

  const gameReset = () => {
    setTimeout(() => {
      grid.resetGrid();
      display.updateDisplay();
      gameModule.currentPlayer = players[0];
      result.gameOver = false;
    }, 1000);
  };

  const playRound = (ev) => {
    if (grid.getGrid()[ev] === "") {
      grid.markCell(ev, gameModule.currentPlayer.token);
      result.getResult();
      const gameOver = result.gameOver;
      if (gameOver && result.getResult() !== null) {
        console.log(`${result.getResult()}'s have it!`);
        gameReset();
      } else if (gameOver && result.getResult() === null) {
        console.log("That would be a tie");
        gameReset();
      }
      switchTurn();
    }
  };

  return {
    playRound,
    getGrid: grid.getGrid,
    setPlayer: grid.setPlayer,
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

  let gameOver = false;
  let winner = null;

  const getResult = () => {
    for (const con of winCon) {
      let [a, b, c] = con.map((index) => grid.getGrid()[index]);

      if (a !== "" && a === b && b === c) {
        gameOver = true;
        winner = a;
        return winner;
      } else if (grid.getGrid().filter((cell) => cell === "").length === 0) {
        gameOver = true;
        winner = null;
        return winner;
      }
    }
  };

  const getWinner = () => winner;

  const getGameOver = () => gameOver;

  return { getResult, getGameOver, getWinner };
}

function displayMaster() {
  const grid = gameModule.getGrid();

  function clickHandler(ev) {
    const game = gameMaster();
    if (ev.target.id) {
      ev.stopPropagation();
      game.playRound(Number(ev.target.id));
      updateDisplay();
    } else {
      return;
    }
  }

  const updateDisplay = () => {
    const board = document.querySelector(".grid");
    const listeners = gameModule.listeners;
    board.textContent = "";

    grid.forEach((cell, index) => {
      const cells = document.createElement("div");
      cells.classList.add("cellStyle");
      cells.id = index;
      cells.textContent = `${cell}`;
      board.appendChild(cells);
    });

    disableEventListeners(listeners);
    addEventListeners(listeners);
  };

  const addEventListeners = (listeners) => {
    const cells = document.querySelectorAll(".cellStyle");
    cells.forEach((cell) => {
      cell.addEventListener("click", clickHandler);
      listeners.push({ cell, clickHandler });
    });
  };

  const disableEventListeners = (listeners) => {
    // remains unsolved
    listeners.forEach(({ cell, clickHandler }) => {
      cell.removeEventListener("click", clickHandler);
    });
    listeners.length = 0;
  };

  updateDisplay();

  return { updateDisplay, disableEventListeners };
}

function assignPlayers() {
  const game = gameModule;
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
      game.setPlayer(elementId);
    });
  });
}

let bestScore;

function computerPlayer() {
  const grid = gameModule.getGrid();
  const players = gameModule.players;
  const currentPlayer = gameModule.currentPlayer;
  const game = gameMaster();
  const display = displayMaster();
  const scores = {
    computer: 100,
    player: -100,
    tie: 0,
  };

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
        newGrid[index] = players[1].token;
        let { move, score } = minimax(grid, 0, true);
        newGrid[index] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = move.sort((a, b) => b.score - a.score)[0].index;
        }
      }
    }
    game.playRound(bestMove);
    display.updateDisplay();
  }

  function minimax(grid, depth, isMaximizing) {
    const result = getResultCopy(grid);
    if (result === scores.computer) {
      return { score: scores.computer };
    } else if (result === scores.tie) {
      return { score: scores.tie };
    } else if (result === scores.player) {
      return { score: scores.player };
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove = [];
      for (let index = 0; index < grid.length; index++) {
        if (grid[index] === "") {
          grid[index] = players[1].token;
          let { move, score } = minimax(grid, depth + 1, false);
          grid[index] = "";
          if (score >= bestScore) {
            bestScore = score;
            bestMove.push({ index, score });
          }
        }
      }

      return { move: bestMove, score: bestScore };
    } else {
      let bestScore = Infinity;
      let bestMove = [];
      for (let index = 0; index < grid.length; index++) {
        if (grid[index] === "") {
          grid[index] = players[0].token;
          let { move, score } = minimax(grid, depth + 1, true);
          grid[index] = "";
          if (score <= bestScore) {
            bestScore = score;
            bestMove.push({ index, score });
          }
        }
      }
      return { move: bestMove, score: bestScore };
    }
  }
}

function initializeGame() {
  displayMaster();
  assignPlayers();
}

initializeGame();
