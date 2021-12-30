import { OFFSET_X, OFFSET_Y } from "./BoardRenderer";
import { getSocket } from "./socket";
import { LINE_LENGTH } from "./index";
import { possibleMoves } from "./PossibleMove";

export const GUTI_COLOR = {
	PLAYER1: 0x3d5afe,
	PLAYER2: 0xf73378,
	BLANK: 0x111111,
	VALID: 0xcc7a00,
};

export let TURN = GUTI_COLOR.PLAYER1;
let NOT_TURN = function () {
	return TURN === GUTI_COLOR.PLAYER1 ? GUTI_COLOR.PLAYER2 : GUTI_COLOR.PLAYER1;
};

const GUTI_RADIUS = 12;

class GutiManager {
	constructor() {
		this.start();
		this.score = {
			green: 0,
			pink: 0,
		};
		this.my_color = null;
		this.game_type = null;
		this.partner_socket_id = null;
	}

	start() {
		GutiManager.orientation = new Array(25)
			.fill(GUTI_COLOR.PLAYER2, 0, 10)
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

	update() {
		GutiManager.update = false;
	}

	draw(board) {
		if (GutiManager.update) return;
		// Add turn text
		board.add.text(OFFSET_X, 50, "TURN", {
			backgroundColor: `#${TURN.toString(16)}`
		});

		GutiManager.update = true;
		let radius = GUTI_RADIUS;
		let i = 0;
		for (let guti of this.getGutiPositions(LINE_LENGTH / 4)) {
			let circle;
			circle = board.add.circle(
				guti.x,
				guti.y,
				radius,
				i === GutiManager.picked ? 0xdd0000 : guti.color
			);
			guti.i = i;
			// FIXME a lot of interactive is being set, find a way to solve this memory leak
			if (guti.color === TURN) {
				this.addPickUpEvent(circle, guti);
			} else if (guti.color === GUTI_COLOR.VALID) {
				this.addPickUpEvent(circle, guti, "VALID");
			}
			GutiManager.objects[i] = circle;
			i++;
		}
	}

	/**
   *
   * @param circle
   * @param guti
   * @param guti_type "player1" or "VALID"
   */
	addPickUpEvent(circle, guti, guti_type) {
		if (guti_type === "VALID") {
			circle.setInteractive().once("pointerdown", () => {
				this.moveGuti(GutiManager.picked, guti.i);
				getSocket().emit("nextTurn", {
					value: TURN,
					src: GutiManager.picked,
					dest: guti.i,
					room: this.room_name,
				});
				this.killHandler(guti);
				GutiManager.picked = null;
				this.flipTurn();
				GutiManager.update = false;
			});
		} else {
			circle.setInteractive().once("pointerdown", () => {
				if (guti.color === TURN) {
					this.showValidMoves(guti.i, this.getGutiOrientation());
					GutiManager.picked = guti.i;
					GutiManager.update = false;
				}
			});
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
				x: OFFSET_X + column * offset,
				y: OFFSET_Y + row * offset,
				color: guti,
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
   * If the position is blank in the given index
   * @param index
   * @returns {boolean|*}
   */
	flipTurn() {
		TURN =
      TURN === GUTI_COLOR.PLAYER1 ? GUTI_COLOR.PLAYER2 : GUTI_COLOR.PLAYER1;
	}

	/**
   * Updates the orientation of board to show the valid moves
   * @param index
   */
	showValidMoves(index) {
		this.clearSuggestions();
		for (let validMove of possibleMoves(GutiManager.orientation, index)) {
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
			orientation: GutiManager.orientation,
		};
		console.log(game_state);
		let xmlHttp = new XMLHttpRequest();
		let the_url = "http://localhost:3000/gamestate/" + "robin";
		xmlHttp.open("POST", the_url);
		xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlHttp.send(JSON.stringify(game_state));
	}

	importGameState(filename) {}

	killHandler(guti) {
		const diff = Math.abs(GutiManager.picked - guti.i);
		const min = Math.min(GutiManager.picked, guti.i);

		if (
			diff === 10 || // row side kill
      diff === 2 // column side kill
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

	setPartnerId(partner_id) {
		this.partner_socket_id = partner_id;
	}

	/**
   * @param {string} room_name
   */
	setRoomName(room_name) {
		this.room_name = room_name;
	}

	/**
   * @param {0 | 1}turn
   */
	setMyColor(turn) {
		this.my_color = turn ? GUTI_COLOR.PLAYER1 : GUTI_COLOR.PLAYER2;
	}

	/**
   * @param {'pass_n_play'|'vs_computer'|'online'|'with_friends'} game_type
   */
	setGameType(game_type) {
		this.game_type = game_type;
	}
}

export function isBlank(index) {
	return GutiManager.orientation[index] !== GUTI_COLOR.BLANK ? false : index;
}

export default new GutiManager();
