import { OFFSET_X, OFFSET_Y } from "./BoardRenderer";
import { convertToMatrixCoord, convertToOrientation, inBound, rowColumnOfMat } from "./Validity";

const GUTI_COLOR = {
  PLAYER1: 0x006A4E,
  PLAYER2: 0xDB7093,
  BLANK: 0x111111,
  VALID: 0xCC7A00
};

let TURN = GUTI_COLOR.PLAYER1;
let NOT_TURN = function() {
  return TURN === GUTI_COLOR.PLAYER1 ? GUTI_COLOR.PLAYER2 : GUTI_COLOR.PLAYER1;
};

const GUTI_RADIUS = 8;

class GutiManager {
  constructor() {
    this.start();
    this.score = {
      green: 0,
      pink: 0
    };
  }

  start() {
    GutiManager.orientation = new Array(25).fill(GUTI_COLOR.PLAYER2, 0, 10)
      .fill(GUTI_COLOR.BLANK, 10, 15)
      .fill(GUTI_COLOR.PLAYER1, 15, 25);
    GutiManager.objects = { ...GutiManager.orientation };
  }

  /**
   * 1, 0, -1 representing the sequence of gutis
   * @returns {*}
   */
  getGutiOrientation() {
    return GutiManager.orientation;
  }

  moveGuti(source, dest) {
    GutiManager.orientation[dest] = GutiManager.orientation[source];
    GutiManager.orientation[source] = GUTI_COLOR.BLANK;
    this.clearSuggestions();
  }

  draw(board) {
    if (GutiManager.update) return;
    // Add turn text
    board.add.text(OFFSET_X, 50, "TURN", { fill: TURN === GUTI_COLOR.PLAYER1 ? "green" : "red" });

    GutiManager.update = true;
    let radius = GUTI_RADIUS;
    let i = 0;
    for (let guti of this.getGutiPositions()) {
      let circle;
      circle = board.add.circle(guti.x, guti.y, radius, i === GutiManager.picked ? 0xdd0000 : guti.color);
      guti.i = i;
      // FIXME a lot of interactive is being set, find a way to solve this memory leak
      if (guti.color === TURN) {
        circle.setInteractive().once("pointerdown", () => {
          if (guti.color === TURN) {
            this.showValidMoves(guti.i, this.getGutiOrientation());
            GutiManager.picked = guti.i;
            GutiManager.update = false;
          }
        });
      } else if (guti.color === GUTI_COLOR.VALID) {
        circle.setInteractive().once("pointerdown", () => {
          this.moveGuti(GutiManager.picked, guti.i);
          this.killHandler(guti);
          GutiManager.picked = null;
          this.flipTurn();
          GutiManager.update = false;
        });
      }
      GutiManager.objects[i] = circle;
      i++;
    }
  }

  /**
   * Get geometric position of gutis
   * @param offset
   * @returns {[]}
   */
  getGutiPositions(offset = 100) {
    let gutis = [];
    let row = 0;
    let column = 0;
    for (let guti of this.getGutiOrientation()) {
      gutis.push({
        x: OFFSET_X + column * 100,
        y: OFFSET_Y + row * 100,
        color: guti
      });
      if ((column + 1) % 5 === 0) {
        row++;
        column = 0;
        continue;
      }
      column++;
    }
    return gutis;
  }


  /**
   * Valid moves of a guti in index position
   * @param index
   * @returns {[]}
   */
  possibleMoves(index) {
    let matrixCord = convertToMatrixCoord(index);
    let validMoves = [];
    let row = matrixCord[0];
    let column = matrixCord[1];

    // Cross
    validMoves.push([row, column + 1]);
    validMoves.push([row, column - 1]);
    validMoves.push([row + 1, column]);
    validMoves.push([row - 1, column]);

    // Diags
    if ((row % 2 === 0 && column % 2 === 0)
      || (row % 2 !== 0 && column % 2 !== 0)) {
      validMoves.push([row + 1, column + 1]);
      validMoves.push([row + 1, column - 1]);
      validMoves.push([row - 1, column - 1]);
      validMoves.push([row - 1, column + 1]);
    }

    validMoves = validMoves.map((value) => {
      // boundary check
      if (inBound(value[0]) && inBound(value[1]))
        return convertToOrientation(value[0], value[1]);
      else
        return -1;
    });
    let additionalMoves = [];
    validMoves = validMoves.filter(function (idx) {
      // Must be on empty place
      if (!GutiManager.isBlank(idx)) {
        if (GutiManager.orientation[idx] === NOT_TURN()) {
          // Got contact with a guti of opponent

          let me = rowColumnOfMat(index);
          let opponent = rowColumnOfMat(idx);
          if (me.col === opponent.col) {
            // Same column
            if (me.row < opponent.row) {
              // My guti is below opponents guti
              if (GutiManager.isBlank(convertToOrientation(opponent.row + 1, me.col))) {
                // valid move is above opponent
                additionalMoves.push(convertToOrientation(opponent.row + 1, me.col));
              }
            } else if (me.row > opponent.row) {// My guti is above opponents guti
              if (GutiManager.isBlank(convertToOrientation(opponent.row - 1, me.col))) {
                // valid move is below opponent
                additionalMoves.push(convertToOrientation(opponent.row - 1, me.col));
              }
            }
          } else if (me.row === opponent.row) {
            // same row
            if (me.col > opponent.col) {
              // Opp is in right side
              if (GutiManager.isBlank(convertToOrientation(me.row, opponent.col - 1))) {
                additionalMoves.push(convertToOrientation(me.row, opponent.col - 1));
              }
            } else if (me.col < opponent.col) {
              // Opp is in left side
              if (GutiManager.isBlank(convertToOrientation(me.row, opponent.col + 1))) {
                additionalMoves.push(convertToOrientation(me.row, opponent.col + 1));
              }
            }
          }

          return false;
        }
      }

      // Must be blank position to avoid putting on top of another GUTI
      return GutiManager.orientation[idx] === GUTI_COLOR.BLANK ? idx : false;
    });
    validMoves.push(...additionalMoves);
    return validMoves;
  }

  /**
   * If the position is blank in the given index
   * @param index
   * @returns {boolean|*}
   */
  static isBlank(index) {
    return GutiManager.orientation[index] !== GUTI_COLOR.BLANK ? false : index;
  }

  flipTurn() {
    TURN = TURN === GUTI_COLOR.PLAYER1 ? GUTI_COLOR.PLAYER2 : GUTI_COLOR.PLAYER1;
  }

  /**
   * Updates the orientation of board to show the valid moves
   * @param index
   */
  showValidMoves(index) {
    this.clearSuggestions();
    for (let validMove of this.possibleMoves(index)) {
      GutiManager.orientation[validMove] = GUTI_COLOR.VALID;
    }
  }

  clearSuggestions() {
    GutiManager.orientation = GutiManager.orientation.map((value) => {
      if (value === GUTI_COLOR.VALID) {
        return GUTI_COLOR.BLANK;
      } else {
        return value;
      }
    });
  }

  exportGameState() {
    let game_state = {
      turn: TURN,
      orientation: GutiManager.orientation
    };
    console.log(game_state);
    let xmlHttp = new XMLHttpRequest();
    let the_url = "http://localhost:3000/gamestate/" + "robin";
    xmlHttp.open("POST", the_url);
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify(game_state));
  }

  importGameState(filename) {

  }

  killHandler(guti) {
    const diff = Math.abs(GutiManager.picked - guti.i);
    const min = Math.min(GutiManager.picked, guti.i);


    if (diff === 10 // row side kill
      || diff === 2 // column side kill
    ) {
      if (diff === 10) {
        GutiManager.orientation[min + 5] = GUTI_COLOR.BLANK;
      } else if (diff === 2) {
        GutiManager.orientation[min + 1] = GUTI_COLOR.BLANK;
      }
      if (TURN === GUTI_COLOR.PLAYER1) {
        this.score.green++;
      } else {
        this.score.pink++;
      }
      this.updateScore(this.score.green, this.score.pink);
    }
  }

  updateScore(green, pink) {
    console.log(green, pink);
  }
}

export default new GutiManager();
