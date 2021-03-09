import {GUTI_COLOR} from "../views/BoardView";


class Board {
	constructor() {
		let gutis = new Array(25).fill(GUTI_COLOR.OPP, 0, 10)
			.fill(GUTI_COLOR.BLANK, 10, 15)
			.fill(GUTI_COLOR.OWN, 15, 25);
		this.gutis = gutis;
		this.turn = GUTI_COLOR.OWN;
		this.picked = null;
	}
}

export default Board;
