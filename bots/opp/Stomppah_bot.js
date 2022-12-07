var target,
    numberItemTypes = 0,
    totalFruits = [],
    myFruits = [],
    hisFruits = [],
    remainingFruits = [],
    deadFruits = [];
/**
 * Configure settings for new game.
 */
function new_game() {
    // get how many types of fruit this game
    numberItemTypes = get_number_of_item_types();

    // get totals of each type of fruit this game
    for (var i = 1; i <= numberItemTypes; i++) {
        totalFruits[i] = get_total_item_count(i);
    }
}
/**
 * Main loop for determining next direction to take.
 */
function make_move() {

    // get state of board this turn
    var board = get_board(),

    // get my position
        myX = get_my_x(),
        myY = get_my_y(),

    // get opponents position
        hisX = get_opponent_x(),
        hisY = get_opponent_y();

    get_current_counts();

    // if we found an item and it isn't dead
    if (board[myX][myY] > 0 && !deadFruits[board[myX][myY]]) {
        return TAKE;
    }

    var rand = Math.random() * 10;

    if (rand < 1) return NORTH;
    if (rand < 2) return SOUTH;
    if (rand < 3) return EAST;
    if (rand < 4) return WEST;

    return move_toward(hisX, hisY);
}
/**
 * Update arrays of fruit totals
 */
function get_current_counts() {
    for (var i = 1; i <= numberItemTypes; i++) {

        // finds how many items I have of each type
        myFruits[i] = get_my_item_count(i);

        // finds how many items my opponent has of each type
        hisFruits[i] = get_opponent_item_count(i);

        // finds how many fruits are left of each type
        remainingFruits[i] = totalFruits[i] - myFruits[i] - hisFruits[i];

        // if either I or my opponent have more than half of a particular type of fruit
        if (myFruits[i] > totalFruits[i] / 2 || hisFruits[i] > totalFruits[i] / 2) {

            // mark type as dead
            deadFruits[i] = 1;
        } else {
            deadFruits[i] = 0;
        }
    }
}
/**
 * Distance between two points (in turns)
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {number}
 */
function distance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
/**
 * Move randomly toward a position
 * @param x
 * @param y
 * @returns {*}
 */
function move_toward(x, y) {
    var moves = [];
    if (x < get_my_x()) moves.push(WEST);
    if (x > get_my_x()) moves.push(EAST);
    if (y < get_my_y()) moves.push(NORTH);
    if (y > get_my_y()) moves.push(SOUTH);
    if (moves.length === 0) return PASS;
    return moves[Math.floor(Math.random() * moves.length)];
}
/**
 * Returns default board for testing.
 * @returns {number}
 */
function default_board_number() {
    return 123;
}
/**
 * Returns the index of the maximum numeric value of an array.
 * @param array
 * @returns {number}
 */
Array.max = function (array) {
    return Math.max.apply(Math, array);
};
/**
 * Returns the index of the minimum numeric value of an array.
 * @param array
 * @returns {number}
 */
Array.min = function (array) {
    return Math.min.apply(Math, array);
};