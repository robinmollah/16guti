import { OFFSET_X, OFFSET_Y } from "./BoardRenderer";
import { getSocket } from "./socket";
import { LINE_LENGTH } from "./index";
import { possibleMoves } from "./PossibleMove";
import Phaser from "phaser";
import { GAME_TYPE } from "./consts/GAME_TYPE";

export const GUTI_COLOR = {
	PLAYER1: 0x3d5afe,
	PLAYER2: 0xf73378,
	BLANK: 0xdddddd,
	VALID: 0xcc7a00,
};

export let TURN = GUTI_COLOR.PLAYER1;
const GUTI_RADIUS = 12;

/**
 * @typedef {Object} GutiManager
 * @property {Color} my_color
 * @property {'pass_n_play'|'vs_computer'|'online'|'with_friends'} game_type
 * @property {name: String, value: Phaser.Sound.BaseSound} sound_effects
 */
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
		this.turnTextView = null;
		this.gutiGameObjects = [];
		this.sound_effects = {};
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
   * @returns {GUTI_COLOR[]}
   */
	getGutiOrientation() {
		return GutiManager.orientation;
	}

	moveGuti(source, dest) {
		GutiManager.orientation[dest] = GutiManager.orientation[source];
		GutiManager.orientation[source] = GUTI_COLOR.BLANK;
		this.play("move_guti");
		this.clearSuggestions();
	}

	update() {
		GutiManager.update = false;
	}

	draw(board) {
		if (GutiManager.update) return;
		this.updateTurn(board);

		GutiManager.update = true;
		let radius = GUTI_RADIUS;
		let i = 0;
		for (let guti of this.getGutiPositions(LINE_LENGTH / 4)) {
			let circle = board.add.circle(
				guti.x,
				guti.y,
				i === GutiManager.picked ? radius * 1.3 : radius,
				guti.color === GUTI_COLOR.VALID ? TURN : guti.color,
			);
			if(guti.color === GUTI_COLOR.VALID) {
				circle.alpha = 0.3;
				board.tweens.add({
					targets: circle,
					alpha: 1,
					duration: 200,
					ease: Phaser.Math.Easing.Bounce.InOut,
					repeat: -1,
					yoyo: true,
				});
			}
			guti.i = i;
			// FIXME a lot of interactive is being set, find a way to solve this memory leak
			if (guti.color === TURN) {
				if (
					this.game_type === GAME_TYPE.PASS_N_PLAY ||
          (this.game_type === GAME_TYPE.ONLINE && this.my_color === TURN)) {
					this.addPickUpEvent(circle, guti);
				}
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
   * @param {"player1" | "VALID" | null}guti_type
   */
	addPickUpEvent(circle, guti, guti_type= null) {
		if (guti_type === "VALID") {
			circle.setInteractive().once("pointerdown", () => {
				GutiManager.objects[GutiManager.picked].destroy();
				this.moveGuti(GutiManager.picked, guti.i);
				if(this.game_type === GAME_TYPE.ONLINE)
					getSocket().emit("nextTurn", {
						value: TURN,
						src: GutiManager.picked,
						dest: guti.i,
						room: this.room_name,
					});
				this.killHandler(GutiManager.picked, guti.i);
				GutiManager.picked = null;
				this.flipTurn();
				GutiManager.update = false;
			});
		} else {
			circle.setInteractive().once("pointerdown", () => {
				if(GutiManager.picked)
					GutiManager.objects[GutiManager.picked].destroy();
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
   * @returns {Array.<{x: Number, y: Number, color: Number}>}
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

	// TODO
	// eslint-disable-next-line no-unused-vars
	importGameState(filename) {}

	killHandler(src, dst) {
		const diff = Math.abs(src - dst);
		const min = Math.min(src, dst);

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
		this.play("kill_guti");
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
		document.getElementById(
			"partner-name"
		).style.backgroundColor = `#${this.my_color.toString(16)}`;
	}

	/**
   * @param {'pass_n_play'|'vs_computer'|'online'|'with_friends'} game_type
   */
	setGameType(game_type) {
		this.game_type = game_type;
	}

	updateTurn(board) {
		let turnText = TURN === this.my_color ? "Your Turn" : "Opponent's Turn";
		if (!this.turnTextView) {
			// this.turnTextView = board.add.text(OFFSET_X, 50, turnText, {
			// 	backgroundColor: `#${TURN.toString(16)}`,
			// });
		} else {
			this.turnTextView.setText(turnText);
			this.turnTextView.setBackgroundColor(`#${TURN.toString(16)}`);
		}
	}

	/**
	 * @param {string} name
	 * @param {Phaser.Sound.BaseSound} audio
	 */
	addSoundEffect(name, audio){
		this.sound_effects[name] = audio;
	}

	play(name){
		try {
			this.sound_effects[name].play();
		} catch (e) {
			console.error("Error playing audio ", e);
		}
	}
}

export function isBlank(index) {
	return GutiManager.orientation[index] !== GUTI_COLOR.BLANK ? false : index;
}

export default new GutiManager();
