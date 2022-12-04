// AI bot using the Expectimax algorithm to compete

var bot = new ExpectimaxBot
function new_game() {
}

function makeMove() {
  bot.makeMove()
}


var ExpectimaxBot = {
  makeMove: function() {
    // to disable this bot, uncomment the next line
    // return PASS;

    ExpectimaxBot.board = get_board();

    // we found an item! take it!
    if (has_item(ExpectimaxBot.board[get_my_x()][get_my_y()])) {
        return TAKE;
    }

    // looks like we'll have to keep track of what moves we've looked at
    ExpectimaxBot.toConsider = new Array();
    ExpectimaxBot.considered = new Array(HEIGHT);
    for (var i = 0; i < WIDTH; i++) {
        ExpectimaxBot.considered[i] = new Array(HEIGHT);
        for (var j = 0; j < HEIGHT; j++) {
            ExpectimaxBot.considered[i][j] = 0;
        }
    }

    // let's find the move that will start leading us to the closest item
    return ExpectimaxBot.findMove(new node(get_my_x(), get_my_y(), -1));
  },

  findMove: function(n) {
    // closest item! we will go to it
    if (has_item(ExpectimaxBot.board[n.x][n.y]))
        return n.move;

    var possibleMove = n.move;

    // NORTH
    if (ExpectimaxBot.considerMove(n.x, n.y-1)) {
        if (n.move == -1) {
            possibleMove = NORTH;
        } 
        ExpectimaxBot.toConsider.push(new node(n.x, n.y-1, possibleMove));
    } 

    // SOUTH
    if (ExpectimaxBot.considerMove(n.x, n.y+1)) {
        if (n.move == -1) {
            possibleMove = SOUTH;
        } 
        ExpectimaxBot.toConsider.push(new node(n.x, n.y+1, possibleMove));
    } 

    // WEST
    if (ExpectimaxBot.considerMove(n.x-1, n.y)) {
        if (n.move == -1) {
            possibleMove = WEST;
        } 
        ExpectimaxBot.toConsider.push(new node(n.x-1, n.y, possibleMove));
    } 

    // EAST 
    if (ExpectimaxBot.considerMove(n.x+1, n.y)) {
        if (n.move == -1) {
            possibleMove = EAST;
        } 
        ExpectimaxBot.toConsider.push(new node(n.x+1, n.y, possibleMove));
    } 

    // take next node to bloom out from
    if (ExpectimaxBot.toConsider.length > 0) {
        var next = ExpectimaxBot.toConsider.shift();
        return ExpectimaxBot.findMove(next);
    }

    // no move found
    return -1;
  },

  considerMove: function(x, y) {
    if (!ExpectimaxBot.isValidMove(x, y)) return false;
    if (ExpectimaxBot.considered[x][y] > 0) return false;
    ExpectimaxBot.considered[x][y] = 1;
    return true;
  },

  isValidMove: function(x, y) {
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT)
      return false;
    return true;
  }
}

function node(x, y, move) {
  this.x = x;
  this.y = y;
  this.move = move;
}


// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
//function default_board_number() {
//    return 123;
//}
