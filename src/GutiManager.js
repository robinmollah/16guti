import { OFFSET_X, OFFSET_Y } from "./BoardRenderer";
import { getSocket } from "./socket";
import { LINE_LENGTH } from "./consts/Layout";
import { possibleMoves } from "./PossibleMove";
import Phaser from "phaser";
import { GAME_TYPE } from "./consts/GAME_TYPE";
import { SOUND_EFFECTS } from "./consts/SOUND_EFFECTS";

export const GUTI_COLOR = {
	PLAYER1: 0x64B5F6, // Lighter Professional Blue
	PLAYER2: 0xF06292, // Lighter Professional Pink
	BLANK: 0xdddddd,
	VALID: 0xcc7a00,
};

// export let TURN = GUTI_COLOR.PLAYER1;
// const GUTI_RADIUS = window.innerWidth * 0.027;
export let TURN = GUTI_COLOR.PLAYER1;
const GUTI_RADIUS = LINE_LENGTH * 0.027;

/**
 * @typedef {Object} GutiManager
 * @property {Color} my_color
 * @property {'pass_n_play'|'vs_computer'|'online'|'with_friends'} game_type
 * @property {name: String, value: Phaser.Sound.BaseSound} sound_effects
 */
class GutiManager {
	static picked = null;
	static update = false;
	static orientation = [];
	static objects = {};

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
		this.first_move_done = false;
	}

	start() {
		GutiManager.orientation = new Array(25)
			.fill(GUTI_COLOR.PLAYER2, 0, 10)
			.fill(GUTI_COLOR.BLANK, 10, 15)
			.fill(GUTI_COLOR.PLAYER1, 15, 25);
		GutiManager.objects = { ...GutiManager.orientation };
		window.turn_indicator.innerText = this.isMyTurn() ? window.TEXT_YOUR_TURN : window.TEXT_OPPONENTS_TURN;
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
		this.play(SOUND_EFFECTS.MOVE_GUTI);
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
			let gutiImage = board.add.image(
				guti.x,
				guti.y,
				"guti"
			);

			// Set display size based on radius
			let currentRadius = i === GutiManager.picked ? radius * 1.3 : radius;
			gutiImage.setDisplaySize(currentRadius * 2, currentRadius * 2);

			// Add selection ring if picked
			if (i === GutiManager.picked) {
				const selectionRing = board.add.graphics();
				selectionRing.lineStyle(2, 0xffffff, 0.8);
				selectionRing.strokeCircle(guti.x, guti.y, currentRadius + 5);
				GutiManager.objects["selectionRing"] = selectionRing;
			}

			// Apply mask to fix transparency (square look)
			const mask = board.make.graphics();
			mask.fillStyle(0xffffff);
			mask.beginPath();
			mask.arc(guti.x, guti.y, currentRadius, 0, Math.PI * 2);
			mask.fillPath();
			gutiImage.setMask(mask.createGeometryMask());

			// Apply tint
			if (guti.color === GUTI_COLOR.VALID) {
				gutiImage.setTint(TURN);
				gutiImage.alpha = 0.3;
				board.tweens.add({
					targets: gutiImage,
					alpha: 1,
					duration: 200,
					ease: Phaser.Math.Easing.Bounce.InOut,
					repeat: -1,
					yoyo: true,
				});
			} else {
				gutiImage.setTint(guti.color);
			}

			guti.i = i;
			// FIXME a lot of interactive is being set, find a way to solve this memory leak
			if (guti.color === TURN) {
				if (
					this.game_type === GAME_TYPE.PASS_N_PLAY ||
					(this.game_type === GAME_TYPE.ONLINE && this.my_color === TURN)) {
					this.addPickUpEvent(board, gutiImage, guti);
				}
			} else if (guti.color === GUTI_COLOR.VALID) {
				this.addPickUpEvent(board, gutiImage, guti, "VALID");
			}
			GutiManager.objects[i] = gutiImage;
			i++;
		}
	}

	/**
   *
   * @param board
   * @param circle
   * @param guti
   * @param {"player1" | "VALID" | null}guti_type
   */
	addPickUpEvent(board, circle, guti, guti_type = null) {
		if (guti_type === "VALID") {
			circle.setInteractive().once("pointerdown", () => {
				window.startTurnCountdown();
				window.flipTurnText();
				const pickedIndex = GutiManager.picked;
				if (pickedIndex === null || pickedIndex === undefined) {
					console.error("No guti selected to move.");
					return;
				}
				const pickedCircle = GutiManager.objects[pickedIndex];
				if (!pickedCircle || !pickedCircle.disableInteractive) {
					console.error("Selected guti object not found or invalid at index", pickedIndex);
					return;
				}
				// Disable interaction on the picked circle to prevent double-clicks during animation
				pickedCircle.disableInteractive();

				// Animate the picked guti to the destination
				board.tweens.add({
					targets: pickedCircle,
					x: guti.x,
					y: guti.y,
					duration: 300,
					ease: "Power2",
					onComplete: () => {
						pickedCircle.destroy();
						this.moveGuti(pickedIndex, guti.i);
						if (this.game_type === GAME_TYPE.ONLINE)
							getSocket().emit("nextTurn", {
								value: TURN,
								src: pickedIndex,
								dest: guti.i,
								room: this.room_name,
							});
						this.killHandler(pickedIndex, guti.i);
						GutiManager.picked = null;
						this.flipTurn();
						GutiManager.update = false;
					},
				});
			});
		} else {
			circle.setInteractive().once("pointerdown", () => {
				if (GutiManager.picked !== null && GutiManager.picked !== undefined) {
					if (GutiManager.objects[GutiManager.picked]) {
						GutiManager.objects[GutiManager.picked].destroy();
					}
				}
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
		let orientation;
		if (!this.first_move_done) {
			orientation = this.my_color === GUTI_COLOR.PLAYER1 ? this.getGutiOrientation() : this.getGutiOrientation().reverse();
			this.first_move_done = true;
		} else {
			orientation = this.getGutiOrientation();
		}
		for (let guti of orientation) {
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

	isMyTurn() {
		return this.my_color === TURN;
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
	importGameState(filename) { }

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
		this.play(SOUND_EFFECTS.KILL_GUTI);
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
		let text = TURN === GUTI_COLOR.PLAYER1 ? "BLUE'S TURN" : "PINK'S TURN";
		let y_pos = OFFSET_Y * 0.3; // Static top position

		if (!this.turnTextView) {
			// Top/Bottom Bar Background
			this.barBg = board.add.graphics();
			this.barBg.fillStyle(0x1a1a1a, 0.8);
			this.barBg.fillRoundedRect(window.innerWidth * 0.1, y_pos - 25, window.innerWidth * 0.8, 50, 25);

			this.turnTextView = board.add.text(window.innerWidth / 2, y_pos, text, {
				fontFamily: "Outfit, Arial",
				fontSize: "24px",
				fontStyle: "bold",
				color: "#ffffff",
				align: "center",
			});
			this.turnTextView.setOrigin(0.5);
		} else {
			this.turnTextView.setText(text);
			this.turnTextView.y = y_pos;

			// Update Bar Position
			this.barBg.clear();
			this.barBg.fillStyle(0x1a1a1a, 0.8);
			this.barBg.fillRoundedRect(window.innerWidth * 0.1, y_pos - 25, window.innerWidth * 0.8, 50, 25);

			// Optional: Add a glow or color highlight to the bar based on turn
			this.barBg.lineStyle(2, TURN, 0.5);
			this.barBg.strokeRoundedRect(window.innerWidth * 0.1, y_pos - 25, window.innerWidth * 0.8, 50, 25);
		}
	}

	/**
	 * @param {string} name
	 * @param {Phaser.Sound.BaseSound} audio
	 */
	addSoundEffect(name, audio) {
		this.sound_effects[name] = audio;
	}

	play(name) {
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
