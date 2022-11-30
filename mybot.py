import math

def new_game():
  return

def make_move():
  board = get_board()

  # we found an item! take it!
  if (board[get_my_x()][get_my_y()] > 0):
    return TAKE

  rand = math.random() * 4

  if (rand < 1):
    return NORTH
  if (rand < 2):
    return SOUTH
  if (rand < 3):
    return EAST
  if (rand < 4):
    return WEST

  return PASS

# Optionally include this function if you'd like to always reset to a 
# certain board number/layout. This is useful for repeatedly testing your
# bot(s) against known positions.
#
#def default_board_number():
#  return 123
