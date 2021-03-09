import {GUTI_COLOR} from "../views/BoardView";

class BoardController {
	constructor(board) {
		this.board = board;
	}

	renderValidMoves(){

	}

	getValidMoves(){

	}

	clicked(guti){
		if(guti.color === GUTI_COLOR.BLANK){
			return;
		}
		if(guti.color === GUTI_COLOR.VALID){
			this.board.picked = null;
			this.flipTurn();
		}
		if(guti.color === this.board.turn){
			this.board.picked = guti;
		}

	}

	flipTurn(){
		this.board.turn = this.board.turn === GUTI_COLOR.OWN ? GUTI_COLOR.OPP : GUTI_COLOR.OWN;
	}
}

export default BoardController;
