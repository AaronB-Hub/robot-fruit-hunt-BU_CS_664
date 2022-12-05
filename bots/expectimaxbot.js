// AI bot using the Expectimax algorithm to compete

// Variables for tweaking the algorithm
var gamma = 0.2;
var max_depth = 3;
var MAXSCORE = 1000000000;
var MINSCORE = -MAXSCORE;

function new_game() {
}

function make_move() {
  return ExpectimaxBot.getMove()["move"];
}

var ExpectimaxBot = {

  generateMoves: function(pos) {
    let x = pos[0];
    let y = pos[1];

    var nextMoves = [];  // [EAST, WEST, NORTH, SOUTH, TAKE, PASS]

    if (x != WIDTH) {
      nextMoves.push(EAST);
    }
    if (x != 0) {
      nextMoves.push(WEST);
    }
    if (y != HEIGHT) {
      nextMoves.push(NORTH);
    }
    if (y != 0) {
      nextMoves.push(SOUTH);
    }
    nextMoves.push(TAKE);
    nextMoves.push(PASS);

    return nextMoves;
  },

  getMove: function() {
    var pl_x = get_my_x();
    var pl_y = get_my_y();
    var op_x = get_opponent_x();
    var op_y = get_opponent_y();
    var pl = [pl_x, pl_y]
    var op = [op_x, op_y]
    var pos = [pl, op]
    var items = [Board.totalItems, Board.myBotCollected, Board.simpleBotCollected]
    var board = JSON.parse(JSON.stringify(get_board()));  // Create a copy so that it can be modified
    
    this.nodeExpanded = 0;
    return this.expectiminimax(max_depth, 0, pos, items, board);
  },

  expectiminimax: function(depth, player, pos, items, board) {
    // Players: 0 = me, 1 = them

    //console.log('In expectimax, depth: ' + depth + ' for player ' + player);
    // generate moves
    this.nodeExpanded += 1;
    var nextMoves = this.generateMoves(pos[player]);
    var bestScore = (player === 0) ? MINSCORE : MAXSCORE;
    var opponent = player === 0 ? 1 : 0;
    var currentScore;
    var bestMove = -1;
    var cap = [];
    

    if (depth == 0) {
      bestScore = this.getScore(items);
    } else {

      for (move in nextMoves) {
        if (move == NORTH) {
          pos[player][1] ++;
        } else if (move == SOUTH) {
          pos[player][1] --;
        } else if (move == EAST) {
          pos[player][0] ++;
        } else if (move == WEST) {
          pos[player][0] --;
        } else if ((move == TAKE) && (board[pos[player][0]][pos[player][1]] != 0)) {
          // Account for both bots trying to take the same fruit on the same turn
          if (player === 0) {
            items[1][board[pos[player][0]][pos[player][1]]-1]++;
            board[pos[player][0]][pos[player][1]] = board[pos[player][0]][pos[player][1]] * -1;  // Mark that the player took this fruit
          } else {
            if (board[pos[player][0]][pos[player][1]] < 0) {
              items[2][(-1 * board[pos[player][0]][pos[player][1]])-1] = items[2][(-1 * board[pos[player][0]][pos[player][1]])-1] + 0.5;
              items[1][(-1 * board[pos[player][0]][pos[player][1]])-1] = items[1][(-1 * board[pos[player][0]][pos[player][1]])-1] - 0.5;  // Adjust the player's score since the opponent bot also picked this up
              board[pos[player][0]][pos[player][1]] = 0;
            } else {
              items[2][board[pos[player][0]][pos[player][1]]-1]++;
              board[pos[player][0]][pos[player][1]] = 0;
            }
          }
        }
        // Clear all negative values from board after a round completes
        if (player === 1) {
          for (var i=0; i<WIDTH; i++) {
            for (var j=0; j<HEIGHT; j++) {
              if (board[i][j] < 0) {
                board[i][j] = 0;
              }
            }
          }
        }


        currentScore = parseInt(this.expectiminimax(depth - 1, opponent, pos, items, board)["score"]);

        if (player === 0) {
          // player 0 is maximizing
          if (currentScore > bestScore) {
            bestScore = currentScore;
            bestMove = move;
          }
        } else {
          // player 1 is minimizing
          if (currentScore < bestScore) {
            bestScore = currentScore;
            bestMove = move;
          }
        }
      }
    }

    return {
      "move": bestMove,
      "score": bestScore,
    };
  },

  getScore: function(items) {

    /* Score Calculation Notes - DIDN'T USE!!!
    Score has two components:
    Item Type score
    Individual items scores

    Highest value fruit: secures a win for an item type
    Lowest value fruit: fruit that for an item type that is already decided

    Need "decided" calculation
    Metric for 'how far from decided' - if very close to decided, then each item has a high value
    Metric for 'deciding in my favor' - if helps to decide in your favor ()
    Each item value is 'deciding in my favor' / 'how far from decided' - if very close to deciding in my favor, then each item has a high value
    */

    // var items = [Board.totalItems, Board.myBotCollected, Board.simpleBotCollected]

    var item_type_score_max = 0;  // Player's maximum score for item type wins (Possible range: -3 to +3, although game will end at -2/+2)
    var item_type_score_min = 0;  // Player's minimum score for item type wins
    var item_type_score_winning = 0;  // Sum of Player's score within undecided item types
    var item_types_left = Board.numberOfItemTypes;
    for (var i=0; i < Board.numberOfItemTypes; i++) {
      var diff = items[1][i] - items[2][i];
      var numleft = items[0][i] - items[1][i] - items[2][i];
      var item_score_max = diff + numleft;  // Player's maximum score for this item type (if <0, then can't win this item type)
      var item_score_min = diff - numleft;  // Player's miniumum score for this item type (if >0, then always wins this item type)
      if (item_score_min == 0 && item_score_max == 0) {  // tie
        item_types_left --;
      } else if (item_score_min >= 0) {
        item_type_score_max ++;  // player 1 could win or tie
        if (item_score_min > 0) {
          item_type_score_min ++;  // player 1 wins for this type of fruit
          item_types_left --;
        } else {
          item_type_score_winning += diff / items[0][i];  // Player's current score for this item type
        }
      } else if (item_score_max <= 0) {
        item_type_score_min --;  // player 2 could win or tie
        if (item_score_max < 0) {
          item_type_score_max --;  // player 2 wins
          item_types_left --;
        } else {
          item_type_score_winning += diff / items[0][i];  // Player's current score for this item type
        }
      } else if(numleft != 0) {  // still up in the air
        item_type_score_min --;
        item_type_score_max ++;
        item_type_score_winning += diff / items[0][i];  // Player's current score for this item type
      }
    }

    // item_type_score_max + opp_item_type_score_min = 0
    // item_type_score_min + opp_item_type_score_max = 0
    var opp_item_type_score_max = -1 * item_type_score_min;  // Opponent's maximum score for item type wins (Possible range: -3 to +3, although game will end at -2/+2)
    var opp_item_type_score_min = -1 * item_type_score_max;  // Opponent's minimum score for item type wins

    // want to maximize own score and minimize opponent's score
    //return p0score + (-p1score);
    return item_type_score_max + item_type_score_min + item_type_score_winning;
  },
}


// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
//function default_board_number() {
//    return 123;
//}
