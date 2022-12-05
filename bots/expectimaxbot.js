// AI bot using the Expectimax algorithm to compete

// Variables for tweaking the algorithm
var gamma = 0.2;
var max_depth = 3;
var MAXSCORE = 1000000000;
var MINSCORE = -MAXSCORE;

function new_game() {
}

function make_move() {
  return ExpectimaxBot.makeMove();
}


function node(x, y, move) {
  this.x = x;
  this.y = y;
  this.move = move;
}

var ExpectimaxBot = {
  makeMove: function() {
    // to disable this bot, uncomment the next line
    // return PASS;

    this.board = get_board();

    // we found an item! take it!
    if (has_item(this.board[get_my_x()][get_my_y()])) {
      return TAKE;
    }

    // looks like we'll have to keep track of what moves we've looked at
    this.toConsider = new Array();
    this.considered = new Array(HEIGHT);
    for (var i = 0; i < WIDTH; i++) {
      this.considered[i] = new Array(HEIGHT);
      for (var j = 0; j < HEIGHT; j++) {
        this.considered[i][j] = 0;
      }
    }

    // let's find the move that will start leading us to the closest item
    return this.findMove(new node(get_my_x(), get_my_y(), -1));
  },

  findMove: function(n) {
    // closest item! we will go to it
    if (has_item(this.board[n.x][n.y]))
      return n.move;

    var possibleMove = n.move;

    // NORTH
    if (this.considerMove(n.x, n.y-1)) {
      if (n.move == -1) {
        possibleMove = NORTH;
      } 
      this.toConsider.push(new node(n.x, n.y-1, possibleMove));
    } 

    // SOUTH
    if (this.considerMove(n.x, n.y+1)) {
      if (n.move == -1) {
        possibleMove = SOUTH;
      } 
      this.toConsider.push(new node(n.x, n.y+1, possibleMove));
    } 

    // WEST
    if (this.considerMove(n.x-1, n.y)) {
      if (n.move == -1) {
        possibleMove = WEST;
      } 
      this.toConsider.push(new node(n.x-1, n.y, possibleMove));
    } 

    // EAST 
    if (this.considerMove(n.x+1, n.y)) {
      if (n.move == -1) {
        possibleMove = EAST;
      } 
      this.toConsider.push(new node(n.x+1, n.y, possibleMove));
    } 

    // take next node to bloom out from
    if (this.toConsider.length > 0) {
      var next = this.toConsider.shift();
      return this.findMove(next);
    }

    // no move found
    return -1;
  },

  considerMove: function(x, y) {
    if (!this.isValidMove(x, y)) return false;
    if (this.considered[x][y] > 0) return false;
    this.considered[x][y] = 1;
    return true;
  },

  isValidMove: function(x, y) {
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT)
      return false;
    return true;
  },

  start: function(board, gamma) {
    this.board = board;  // 2d array of Tiles
    this.row = WIDTH;
    this.col = HEIGHT;
    this.nodeExpanded = 0;
    this.gamma = gamma;
  },

  getScore: function() {
    var p1score = 0;
    var p2score = 0;

    // Score has two components:
    // Item Type score
    // Individual items scores

    // Highest value fruit: secures a win for an item type
    // Lowest value fruit: fruit that for an item type that is already decided

    // Need "decided" calculation
    // Metric for 'how far from decided' - if very close to decided, then each item has a high value
    // Metric for 'deciding in my favor' - if helps to decide in your favor ()
    // Each item value is 'deciding in my favor' / 'how far from decided' - if very close to deciding in my favor, then each item has a high value

    for (var row = 0; row < this.row; row++) {
      for (var col = 0; col < this.col; col++) {
        if (this.board[row][col].belongsTo === 0) {
          p1score += parseInt(this.board[row][col].value);
        } else if (this.board[row][col].belongsTo === 1) {
          p2score += parseInt(this.board[row][col].value);
        }
      }
    }

    // want to maximize own score and minimize opponent's score
    return p1score + (-p2score);
  },

  tileRemain: function() {
    var remain = 0;
    for (var row = 0; row < this.row; row++) {
      for (var col = 0; col < this.col; col++) {
        if (this.board[row][col].belongsTo === null) {
          remain += 1;
        }
      }
    }
    return remain;
  },

  capturable: function(id, player) {
    id = parseInt(id);
    var opponent = player === 0 ? 1 : 0;
    var capturables = [];
    var row, col;
    row = Math.floor(id / this.row);
    col = id - row * this.row;

    if (this.board[row][col === 0 ? 0 : col - 1].belongsTo === opponent) {
      capturables.push((row * this.col + (col === 0 ? 0 : col - 1)));
    }
    if (this.board[row][col === this.col - 1 ? this.col - 1 : col + 1].belongsTo === opponent) {
      capturables.push((row * this.col + (col === this.col - 1 ? this.col - 1 : col + 1)));
    }
    if (this.board[row === 0 ? 0 : row - 1][col].belongsTo === opponent) {
      capturables.push(((row === 0 ? 0 : row - 1) * this.col + col));
    }
    if (this.board[row === this.row - 1 ? this.row - 1 : row + 1][col].belongsTo === opponent) {
      capturables.push(((row === this.row - 1 ? this.row - 1 : row + 1) * this.col + col));
    }
    return capturables;
  },

  getCommandoParaDropMoves: function(player) {
    var moves = {};
    // check player
    for (var row = 0; row < this.row; row++) {
      for (var col = 0; col < this.col; col++) {
        if (this.board[row][col].belongsTo === null) {
          if ((this.board[row][col === 0 ? 0 : col - 1].belongsTo !== player) &&
            (this.board[row][col === this.col - 1 ? this.col - 1 : col + 1].belongsTo !== player) &&
            (this.board[row === 0 ? 0 : row - 1][col].belongsTo !== player) &&
            (this.board[row === this.row - 1 ? this.row - 1 : row + 1][col].belongsTo !== player)) {
            moves[row * this.col + col] = "CPD";
          }
        }
      }
    }

    // best moves place first
    // possibly do {id: score if move made}
    return moves;
  },

  getM1DeathBlitzMoves: function(player) {
    var moves = {};

    for (var row = 0; row < this.row; row++) {
      for (var col = 0; col < this.col; col++) {
        if (this.board[row][col].belongsTo === player) {
          if (this.board[row][col === 0 ? 0 : col - 1].belongsTo === null) {
            if (!moves.hasOwnProperty((row * this.col + (col === 0 ? 0 : col - 1)))) {
              moves[(row * this.col + (col === 0 ? 0 : col - 1))] = "M1DB";
            }
          }
          if (this.board[row][col === this.col - 1 ? this.col - 1 : col + 1].belongsTo === null) {
            if (!moves.hasOwnProperty((row * this.col + (col === this.col - 1 ? this.col - 1 : col + 1)))) {
              moves[(row * this.col + (col === this.col - 1 ? this.col - 1 : col + 1))] = "M1DB";
            }
          }
          if (this.board[row === 0 ? 0 : row - 1][col].belongsTo === null) {
            if (!moves.hasOwnProperty(((row === 0 ? 0 : row - 1) * this.col + col))) {
              moves[((row === 0 ? 0 : row - 1) * this.col + col)] = "M1DB";
            }
          }
          if (this.board[row === this.row - 1 ? this.row - 1 : row + 1][col].belongsTo === null) {
            if (!moves.hasOwnProperty(((row === this.row - 1 ? this.row - 1 : row + 1) * this.col + col))) {
              moves[((row === this.row - 1 ? this.row - 1 : row + 1) * this.col + col)] = "M1DB";
            }
          }
        }
      }
    }
    // possibly do {id: score if move made}
    return moves;
  },

  getSabotageMoves: function(player) {
    var M1DB = this.getM1DeathBlitzMoves(player);
    var opponent = player === 0 ? 1 : 0;
    var moves = {};

    for (var row = 0; row < this.row; row++) {
      for (var col = 0; col < this.col; col++) {
        if (this.board[row][col].belongsTo === opponent) {
          // M1DB is a sure capture, it has higher priority
          if (this.board[row][col === 0 ? 0 : col - 1].belongsTo === null) {
            if (!M1DB.hasOwnProperty((row * this.col + (col === 0 ? 0 : col - 1))) &&
              !moves.hasOwnProperty((row * this.col + (col === 0 ? 0 : col - 1)))) {
              moves[(row * this.col + (col === 0 ? 0 : col - 1))] = "SAB";
            }
          }
          if (this.board[row][col === this.col - 1 ? this.col - 1 : col + 1].belongsTo === null) {
            if (!M1DB.hasOwnProperty((row * this.col + (col === this.col - 1 ? this.col - 1 : col + 1))) &&
              !moves.hasOwnProperty((row * this.col + (col === this.col - 1 ? this.col - 1 : col + 1)))) {
              moves[(row * this.col + (col === this.col - 1 ? this.col - 1 : col + 1))] = "SAB";
            }
          }
          if (this.board[row === 0 ? 0 : row - 1][col].belongsTo === null) {
            if (!M1DB.hasOwnProperty(((row === 0 ? 0 : row - 1) * this.col + col)) &&
              !moves.hasOwnProperty(((row === 0 ? 0 : row - 1) * this.col + col))) {
              moves[((row === 0 ? 0 : row - 1) * this.col + col)] = "SAB";
            }
          }
          if (this.board[row === this.row - 1 ? this.row - 1 : row + 1][col].belongsTo === null) {
            if (!M1DB.hasOwnProperty(((row === this.row - 1 ? this.row - 1 : row + 1) * this.col + col)) &&
              !moves.hasOwnProperty(((row === this.row - 1 ? this.row - 1 : row + 1) * this.col + col))) {
              moves[((row === this.row - 1 ? this.row - 1 : row + 1) * this.col + col)] = "SAB";
            }
          }
        }
      }
    }

    return moves;
  },

  generateMoves: function(player) {
    var nextMoves = {};
    var key;

    if (this.tileRemain() === 0) {
      return nextMoves;
    }

    // get nextMoves, ordered by preference
    var M1DB = this.getM1DeathBlitzMoves(player);
    var SAB = this.getSabotageMoves(player);
    var CPD = this.getCommandoParaDropMoves(player);

    if (Object.keys(M1DB).length !== 0) {
      for (key in M1DB) {
        nextMoves[key] = M1DB[key];
      }
    }
    if (Object.keys(SAB).length !== 0) {
      for (key in SAB) {
        if (!nextMoves.hasOwnProperty(key)) {
          nextMoves[key] = SAB[key];
        }
      }
    }
    if (Object.keys(CPD).length !== 0) {
      for (key in CPD) {
        if (nextMoves.hasOwnProperty(key) && SAB.hasOwnProperty(key)) {
          nextMoves[key] = [SAB[key], CPD[key]];
        } else {
          nextMoves[key] = ["PLCHOLDER", CPD[key]];
        }
      }
    }
    return nextMoves;
  },

  getMove: function(player) {
    return this.expectiminimax(max_depth, player);
  },

  expectiminimax: function(depth, player) {
    // Players: 0 = me, 1 = them

    //console.log('In minimax, depth: ' + depth + ' for player ' + player);
    // generate moves
    this.nodeExpanded += 1;
    var nextMoves = this.generateMoves(player);
    var bestScore = (player === 0) ? MINSCORE : MAXSCORE;
    var opponent = player === 0 ? 1 : 0;
    var currentScore;
    var bestMove = -1;
    var cap = [];
    var moveType;

    if (Object.keys(nextMoves).length === 0 || depth === 0) {
      bestScore = this.getScore();
    } else {
      var row, col, tID, id, r, c;

      for (tID in nextMoves) {
        var capturables = [];
        row = Math.floor(tID / this.row);
        col = tID - row * this.row;

        if (Array.isArray(nextMoves[tID]) && nextMoves[tID][0] === "SAB") { // check sabotage
          // success
          this.board[row][col].belongsTo = player;
          capturables = this.capturable(tID, player);

          // capture if M1DB move
          if (capturables.length > 0) {
            for (id = 0; id < capturables.length; id++) {
              r = Math.floor(capturables[id] / this.row);
              c = capturables[id] - r * this.row;
              this.board[r][c].belongsTo = player;
            }
          }

          currentScore = this.gamma * parseInt(this.expectiminimax(depth - 1, opponent)["score"]);

          if (capturables.length > 0) {
            for (id = 0; id < capturables.length; id++) {
              r = Math.floor(capturables[id] / this.row);
              c = capturables[id] - r * this.row;
              this.board[r][c].belongsTo = (player + 1) % 2;
            }
          }
          capturables = []; // reset capturables so it doesn't interfere with M1DB undo moves
          this.board[row][col].belongsTo = null;

          // failure
          this.board[row][col].belongsTo = opponent;

          currentScore = (1.0 - this.gamma) * parseInt(this.expectiminimax(depth - 1, opponent)["score"]);

          this.board[row][col].belongsTo = null;

          if (player === 0) {
            // player 0 is maximizing
            if (currentScore > bestScore) {
              bestScore = currentScore;
              bestMove = parseInt(tID);
              moveType = nextMoves[tID][0];
              cap = capturables;
            }
          } else {
            // player 1 is minimizing
            if (currentScore < bestScore) {
              bestScore = currentScore;
              bestMove = parseInt(tID);
              moveType = nextMoves[tID][0];
              cap = capturables;
            }
          }
        } // end of sabotage check

        // check M1DB and CPD moves as usual
        this.board[row][col].belongsTo = player;
        if (nextMoves[tID] === "M1DB") {
          capturables = this.capturable(tID, player);
          // capture if M1DB move
          if (capturables.length > 0) {
            for (id = 0; id < capturables.length; id++) {
              r = Math.floor(capturables[id] / this.row);
              c = capturables[id] - r * this.row;
              this.board[r][c].belongsTo = player;
            }
          }
        }

        currentScore = parseInt(this.expectiminimax(depth - 1, opponent)["score"]);

        // undo moves: including capture moves
        if (capturables.length > 0) {
          for (id = 0; id < capturables.length; id++) {
            r = Math.floor(capturables[id] / this.row);
            c = capturables[id] - r * this.row;
            this.board[r][c].belongsTo = (player + 1) % 2;
          }
        }
        this.board[row][col].belongsTo = null;

        if (player === 0) {
          // player 0 is maximizing
          if (currentScore > bestScore) {
            bestScore = currentScore;
            bestMove = parseInt(tID);
            if (nextMoves[tID] === "M1DB") {
              moveType = nextMoves[tID];
            } else {
              moveType = nextMoves[tID][1];
            }
            cap = capturables;
          }
        } else {
          // player 1 is minimizing
          if (currentScore < bestScore) {
            bestScore = currentScore;
            bestMove = parseInt(tID);
            if (nextMoves[tID] === "M1DB") {
              moveType = nextMoves[tID];
            } else {
              moveType = nextMoves[tID][1];
            }
            cap = capturables;
          }
        }
      }
    }

    return {
      "tile": bestMove,
      "score": bestScore,
      "type": moveType,
      "capture": cap
    };
  },
}


// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
//function default_board_number() {
//    return 123;
//}
