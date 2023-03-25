import Phaser from "phaser";
import { OFFSET_X, OFFSET_Y } from "./BoardRenderer";
import { getLines } from "./util";
import GutiManager from "./GutiManager";
import { getSocket } from "./socket";
import { SOUND_EFFECTS } from "./consts/SOUND_EFFECTS";

/**
 *
 * @param {'pass_n_play'|'vs_computer'|'online'|'with_friends'} type
 * @param {String} partner_id
 * @param {String} room_name
 * @param {0 | 1}turn
 */
export function initiateGame(type, partner_id, room_name, turn) {
	const WIDTH = window.innerWidth;
	const config = {
		type: Phaser.AUTO,
		parent: "phaser-example",
		width: WIDTH * 0.99,
		height: window.innerHeight,
		scene: {
			preload: preload,
			create: create,
			update: update,
		},
		backgroundColor: "#b76f20",
	};

	// eslint-disable-next-line no-unused-vars
	const game = new Phaser.Game(config);

	function preload() {
		this.load.audio(SOUND_EFFECTS.MOVE_GUTI, "/assets/audio/click_003.mp3");
		this.load.audio(SOUND_EFFECTS.KILL_GUTI, "/assets/audio/glass_hit_shatter_light_negative.mp3");
	}

	function create() {
		// Draw the board
		GutiManager.game_type = type;
		let boardLines = this.add.graphics({
			lineStyle: {
				width: 4,
				color: 0x444444,
			},
		});
		boardLines.x = OFFSET_X;
		boardLines.y = OFFSET_Y;

		for (let line of getLines()) {
			boardLines.strokeLineShape(line);
		}

		if (type !== "pass_n_play") {
			GutiManager.setPartnerId(partner_id);
			GutiManager.setRoomName(room_name);
			GutiManager.setMyColor(turn);
			GutiManager.setGameType(type);
			let socket = getSocket();
			window.GutiManager = GutiManager;
			socket.on("yourTurn", (data) => {
				console.log("yourTurn: ", data);
				GutiManager.moveGuti(data.src, data.dest);
				GutiManager.killHandler(data.src, data.dest);
				GutiManager.flipTurn();
				GutiManager.update();
			});
		}
		GutiManager.addSoundEffect(SOUND_EFFECTS.MOVE_GUTI, this.sound.add(SOUND_EFFECTS.MOVE_GUTI));
		GutiManager.addSoundEffect(SOUND_EFFECTS.KILL_GUTI, this.sound.add(SOUND_EFFECTS.KILL_GUTI));
	}

	function update() {
		GutiManager.draw(this);
	}
}
