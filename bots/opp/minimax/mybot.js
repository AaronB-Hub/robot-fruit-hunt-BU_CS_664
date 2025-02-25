// From: https://github.com/dima42/fruitbot

/*
Public functions for the game controller to call.  new_game() is run once per game and make_move() is run each move.
*/
function new_game(){
    GameState.own_moves = new Array();
    GameState.opp_moves = new Array();
    GameState.own_taken = new Array();
    GameState.opp_taken = new Array();
    GameState.own_prior_moves = new Array();
}

function make_move(){
    var move = TimeKeeper.getMove(1000);
    trace("scores computed: "+String(comp));
    comp = 0;
    
    GameState.own_moves = new Array();
    GameState.opp_moves = new Array();
    GameState.own_taken = new Array();
    GameState.opp_taken = new Array();
    if (move == TAKE){ 
        GameState.own_prior_moves = new Array();
    } else {
        GameState.own_prior_moves.push(move);
    }
    for (var i = 0; i < GameState.own_prior_moves.length; i++){
        GameState.own_moves.push(GameState.own_prior_moves[i]);
        GameState.own_taken.push(0);
    }
    
    return move;
}

function default_board_number() {
    return 582772;
}
/*
GameState keeps track of the state of the game as we are exploring move trees.

After each move, call reset() to get updated info about the game
use move() and unmove() to change the game state from there.

GameState.board[i][j] - same conventions as get_board()

GameState.fruits[i] - triplet of [total_fruit, own_fruit, opp_fruit] 
0-indexed, so these correspond to get_fruit(i+1) 

GameState.own_moves, GameState.opp_moves - list of hypothetical moves
GameState.own_taken, GameState.opp_taken - correspond to moves, false if no 
fruit was taken on that turn, otherwise 1-indexed fruit (same as board)

*/

var GameState = {

    reset: function(){
        //this will be called every time a move is actually made
        //it will get info about fruit available/taken and bot locations
        GameState.own_position = [get_my_x(), get_my_y()];
        GameState.opp_position = [get_opponent_x(), get_opponent_y()];
        GameState.board = new Array(WIDTH);
        for (var i = 0; i < WIDTH; i++){
            GameState.board[i] = new Array(HEIGHT);
            for (var j = 0; j < HEIGHT; j++){
                var fruit = get_board()[i][j];
                if (get_total_item_count(fruit) >= 
                    2*Math.max(get_my_item_count(fruit), 
                               get_opponent_item_count(fruit))){
                    //ignore fruit that has already been decided
                    GameState.board[i][j] = fruit;
                } else{
                    GameState.board[i][j] = 0;
                }
            }
        } 
        GameState.fruits = new Array();
        //triplet of [total, my, opponent]
        for (var i = 0; i < get_number_of_item_types(); i++){
            GameState.fruits.push([get_total_item_count(i+1), 
                                 get_my_item_count(i+1), 
                                 get_opponent_item_count(i+1)]);
        }


    },

    move: function(own_move, opp_move){
        GameState.geomove(own_move, GameState.own_position, true);
        GameState.geomove(opp_move, GameState.opp_position, true);
        var own_taken = false;
        var opp_taken = false;
        var tie = own_move == TAKE && opp_move == TAKE && 
                  GameState.own_position[0] == GameState.opp_position[0] &&
                  GameState.own_position[1] == GameState.opp_position[1]
        if (own_move == TAKE){
            var i = GameState.own_position[0];
            var j = GameState.own_position[1];
            own_taken = GameState.board[i][j];
            GameState.fruits[own_taken - 1][1] = 
                GameState.fruits[own_taken - 1][1] + 1 - Number(tie)*0.5;
            GameState.board[i][j] = 0;
        }
        if (opp_move == TAKE){
            var i = GameState.opp_position[0];
            var j = GameState.opp_position[1];
            opp_taken = GameState.board[i][j];
            if (tie) opp_taken = own_taken;
            GameState.fruits[opp_taken - 1][2] = 
                GameState.fruits[opp_taken - 1][2] + 1 - Number(tie)*0.5;
            GameState.board[i][j] = 0;
        }
        GameState.own_moves.push(own_move);
        GameState.opp_moves.push(opp_move);
        GameState.own_taken.push(own_taken);
        GameState.opp_taken.push(opp_taken);

    },

    geomove: function(move, object_moving, forward){
        var step = forward?1:-1;
        if (move == EAST) object_moving[0] = object_moving[0] + step;
        if (move == WEST) object_moving[0] = object_moving[0] - step;
        if (move == NORTH) object_moving[1] = object_moving[1] - step;
        if (move == SOUTH) object_moving[1] = object_moving[1] + step;
    },

    unmove: function(){
        var own_move = GameState.own_moves.pop();
        var opp_move = GameState.opp_moves.pop();
        var own_taken = GameState.own_taken.pop();
        var opp_taken = GameState.opp_taken.pop();
        GameState.geomove(own_move, GameState.own_position, false);
        GameState.geomove(opp_move, GameState.opp_position, false);
        var tie = own_taken && opp_taken && 
                  GameState.own_position[0] == GameState.opp_position[0] &&
                  GameState.own_position[1] == GameState.opp_position[1]
        if (own_taken){
            GameState.board[GameState.own_position[0]]
                           [GameState.own_position[1]] = own_taken;
            GameState.fruits[own_taken - 1][1] = 
                GameState.fruits[own_taken - 1][1] - 1 + Number(tie)*0.5;
        } 
        if (opp_taken){
            GameState.board[GameState.opp_position[0]]
                           [GameState.opp_position[1]] = opp_taken;
            GameState.fruits[opp_taken - 1][2] = 
                GameState.fruits[opp_taken - 1][2] - 1 + Number(tie)*0.5;
        }  
    }
}
/*
PossibleMoves.own_candidate_moves and PossibleMoves.opp_candidate_moves
are built based on GameState's positions and previous moves

PossbleMoves.reset() updates them based on GameState.  Right now the possible
moves are based on:
*No going off edges off board
*No going in two opposite directions without a TAKE move in between them
    -a PASS move in between, generated by some sort of bug, also resets this
*All east-west motion comes before north-south motion

In the future it will be helpful to add options here.  More restricted 
possible moves mean missing some cases but deeper search tree.

*/

var PossibleMoves = {
    geoReset: function(position, candidate_move_array, previous_move_array){
        //if previous move is empty/take, append north/south/east/west
        //if previous move is east/west, append that one and north/south
        //if previous move is north/south, append that one only
        last_move = false;
        if (previous_move_array.length > 0) {
            last_move = previous_move_array[previous_move_array.length-1]
            if (last_move == TAKE || last_move == PASS)
                //treat same as empty
                last_move = false;
        }
        if ((!last_move || last_move != SOUTH) && (position[1] > 0))
            candidate_move_array.push(NORTH);
        if ((!last_move || last_move != NORTH) && (position[1] < HEIGHT-1))
            candidate_move_array.push(SOUTH);
        if ((!last_move || (last_move != NORTH && last_move != SOUTH && 
                            last_move != WEST)) && position[0] < WIDTH -1)
            candidate_move_array.push(EAST);
        if ((!last_move || (last_move != NORTH && last_move != SOUTH &&
                            last_move != EAST)) && position[0] > 0)
            candidate_move_array.push(WEST);
    
    },
    
    reset: function(){
        
        PossibleMoves.own_candidate_moves = new Array();
        PossibleMoves.opp_candidate_moves = new Array();        

        if (GameState.board[GameState.own_position[0]]
                           [GameState.own_position[1]] > 0) {
            PossibleMoves.own_candidate_moves.push(TAKE);
        }
        if (GameState.board[GameState.opp_position[0]]
                           [GameState.opp_position[1]] > 0) {
            PossibleMoves.opp_candidate_moves.push(TAKE);
        }

        PossibleMoves.geoReset(GameState.opp_position, 
                               PossibleMoves.opp_candidate_moves,
                               GameState.opp_moves);

        PossibleMoves.geoReset(GameState.own_position, 
                               PossibleMoves.own_candidate_moves,
                               GameState.own_moves);
    }
}
/*
getHeuristicScore() provides a complicated and not particularly tested 
evaluation.

TODO maybe it will be a lot more efficient if rather than calculating the 
score, we keep it in memory and change with move/unmove.
*/

var comp = 0;
//comp keeps track of number of evaluations made.  Will be used for speed 
//optimization.

/*
//We don't need factorials right now because we are not using the probabilistic
//framework
var factorials = new Array();
factorials.push(1);
factorials.push(1);
for (var i = 2; i < 12; i++){
    factorials.push(factorials[i-1]*i);
}
*/

var Scorer = {

    getHeuristicScore: function(){
        comp += 1;
        var score = 0;
        var win_cats = 0;
        var lose_cats = 0;
        var fruit_importance = new Array();
        for (var i = 0; i < GameState.fruits.length; i++){
            fruit_importance.push(0);
            var this_fruit = GameState.fruits[i];
            var total_fruit = this_fruit[0];
            if (this_fruit[1]*2 > total_fruit){
                score += 1;
                win_cats += 1;
                continue;
            }
            if (this_fruit[2]*2 > total_fruit){
                score -= 1;
                lose_cats += 1;
                continue;
            }
            if (this_fruit[1] == this_fruit[2])
                continue;
            score_adj = 0;
            remaining_fruit = total_fruit-this_fruit[1]-this_fruit[2];
            if (remaining_fruit == 0){
                win_cats += 0.5;
                lose_cats += 0.5;
                continue;
            }/*
            //probabilistic framework - not used right now
            for(var j = 0; j <= remaining_fruit; j++){
                //j is how many fruits we will win
                //assumes equal chance of winning each fruit for both bots
                var prob = Math.pow(0.5, remaining_fruit) * 
                           factorials[remaining_fruit]/
                           (1.0*factorials[j]*factorials[remaining_fruit-j]);
                if ((this_fruit[1]+j)*2 > total_fruit){
                    score_adj = prob;
                    continue;
                } 
                if ((this_fruit[1]+j)*2 == total_fruit)
                    continue;
                score_adj = -prob;
            }*/
            //score += score_adj;
            score += (this_fruit[1]-this_fruit[2])/total_fruit;  
        }

        if ((win_cats*2) > GameState.fruits.length){
            return Number.POSITIVE_INFINITY;
        }
        if (win_cats*2 == GameState.fruits.length && 
            lose_cats*2 == GameState.fruits.length)
            return 0;
        /*
        if ((lose_cats*2) > GameState.fruits.length){
            //this is commented out because sometimes we think a situation is
            //a forced loss, but our opponent does not realise it;  in these 
            //cases, we still want to make a decent move based on the distance
            //logic
            return Number.NEGATIVE_INFINITY;
        }
        */

        //we add distance logic if necessary, e.g. no forced win/tie yet
        for (var i = 0; i < WIDTH; i++){
            for (var j = 0; j < HEIGHT; j++){
                if (GameState.board[i][j] > 0){
                    this_fruit = GameState.fruits[GameState.board[i][j] -1];
                    total_fruit = this_fruit[0];
                    if (this_fruit[1]*2 <= total_fruit && 
                        this_fruit[2]*2 <= total_fruit){
                        var diff = Math.abs(this_fruit[1]-this_fruit[2]);
                        var to_win = (total_fruit+1)*0.5 - 
                                     Math.max(this_fruit[1], this_fruit[2]);
                        var own_x = GameState.own_position[0];
                        var own_y = GameState.own_position[1];
                        var opp_x = GameState.opp_position[0];
                        var opp_y = GameState.opp_position[1];
                        var own_dist = Math.abs(own_x - i)+Math.abs(own_y - j);
                        var opp_dist = Math.abs(opp_x - i)+Math.abs(opp_y - j);
                        score += 0.5*(1/(own_dist+1) - 1/(opp_dist+1)) *  
                                     1/(to_win + diff+2);
                    }
                }
            }
        }
        return score;
    }
}
/*
getBestMove() returns the move for which the opponent's best reply is least
effective.

*/

var Player = {
    
    getBestMove: function(depth, start_time, alotted_time) {
        if (new Date()-start_time >= alotted_time)
            return undefined;
        //an undefined return starts a chain of these, and exits minimaxplayer

        PossibleMoves.reset();
        //we need to explicitly copy possible moves because of recursion
        var own_moves = new Array();
        for (var i = 0; i < PossibleMoves.own_candidate_moves.length; i++){
            own_moves.push(PossibleMoves.own_candidate_moves[i]);
        }
        var opp_moves = new Array();
        for (var i = 0; i < PossibleMoves.opp_candidate_moves.length; i++){
            opp_moves.push(PossibleMoves.opp_candidate_moves[i]);
        }

        var best_score = Number.NEGATIVE_INFINITY;
        if (own_moves.length == 0)
            return [PASS, Number.NEGATIVE_INFINITY];
        var best_move = own_moves[0];
        for (var i = 0; i < own_moves.length; i++){
            var worst_score = Number.POSITIVE_INFINITY;
            if (opp_moves.length == 0)
                opp_moves.push(PASS);
            //TODO this is not really correct.  just because a bot has
            //0 legal moves based on its past because we heavily restricted
            //the "possible" moves does not mean we have a forced win
            var opp_best_move = opp_moves[0];
            for (var j = 0; j < opp_moves.length; j++){
                GameState.move(own_moves[i], opp_moves[j])
                var this_score = undefined;
                
                if (depth > 1){
                    var bmbs = Player.getBestMove(depth-1, 
                                                  start_time, alotted_time);
                    if (bmbs == undefined)
                        return undefined;
                    this_score = bmbs[1];
                    this_score += Math.pow(0.1, depth) *
                                  Scorer.getHeuristicScore()
                    //the score is a weighted sum of score at every depth
                    //the weights are highest at the deepest level and
                    //reduced by 90% for each level shallower
                }
                else{
                    this_score = Scorer.getHeuristicScore();
                }
                if (this_score < worst_score){
                     worst_score = this_score;
                     opp_best_move = opp_moves[j];
                }


                GameState.unmove();

                if (worst_score <= best_score) break;
            }
            if (worst_score > best_score) {
                best_score = worst_score
                best_move = own_moves[i];
            }
        }
        return [best_move, best_score];
    },
    
}
/*
uses allocated time to control Player

*/

var TimeKeeper = {
    getMove: function(alotted_time){
        var start_time = new Date();
        depth = 5;
        bestResult = [PASS, 0];
        bmbs = [PASS, 0];
        while( bmbs != undefined && bmbs[1] != Number.POSITIVE_INFINITY
                                 && bmbs[1] != Number.NEGATIVE_INFINITY){
            GameState.reset();
            bmbs = Player.getBestMove(depth, start_time, alotted_time);
            if (bmbs != undefined && bmbs[1] != Number.NEGATIVE_INFINITY
                && (bmbs[0] == PASS || bmbs[0] == TAKE || bmbs[0] == EAST ||
                    bmbs[0] == WEST || bmbs[0] == NORTH || bmbs[0] == SOUTH))
                //sort of overkill;  TODO make some test cases to reduce this
                bestResult = bmbs;         
            depth += 1;
        }
        trace("depth searched: "+String(depth-2));
        trace ("time used: "+String(new Date() - start_time));
        trace("evaluation: "+String(bestResult[1]));
        return bestResult[0];
    }
}
