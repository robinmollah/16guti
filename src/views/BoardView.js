import {OFFSET_X, OFFSET_Y} from "../BoardRenderer";
import BoardController from "../controllers/BoardController";

const GUTI_RADIUS = 8;
export const GUTI_COLOR = {
	OWN: 0x006A4E,
	OPP: 0xDB7093,
	BLANK: 0x111111,
	VALID: 0xCC7A00
}

class BoardView {
	constructor(board, globalView) {
		this.board = board;
		this.globalView = globalView;
		this.controller = new BoardController();
	}

	render(){
		let radius = GUTI_RADIUS;
		let i = 0;
		console.log(this.board, this.globalView);
		for (let guti of this.getGutiPositions()){
			let circle;
			circle = this.globalView.add.circle(guti.x, guti.y, radius, i === this.board.picked ? 0xdd0000 : guti.color);
			guti.i = i;
			// FIXME a lot of interactive is being set, find a way to solve this memory leak
			if(guti.color === this.board.turn){
				circle.setInteractive().once('pointerdown', () => {
					this.controller.clicked(guti);
					// if(guti.color === this.board.turn){
					// 	this.showValidMoves(guti.i, this.board.gutis);
					// 	this.board.picked = guti.i;
					// 	GutiManager.update = false;
					// }
				});
			} else if(guti.color === GUTI_COLOR.VALID){
				circle.setInteractive().once('pointerdown', () => {
					this.controller.clicked(guti);
					// this.moveGuti(this.board.picked, guti.i);
					// this.board.picked = null;
					// this.flipTurn();
					// // GutiManager.update = false;
				});
			}
			i++;
		}
	}

	/**
	 * Get geometric position of gutis
	 * @param offset
	 * @returns {[]}
	 */
	getGutiPositions(offset = 100){
		let gutis = [];
		let row = 0;
		let column = 0;
		for (let guti of this.board.gutis){
			gutis.push({
				x: OFFSET_X + column * 100,
				y: OFFSET_Y + row * 100,
				color: guti
			});
			if((column + 1) % 5 === 0) {
				row++;
				column = 0;
				continue;
			}
			column++;
		}
		return gutis;
	}

}


export default BoardView;
