import Phaser from "phaser";
import { OFFSET_X, OFFSET_Y } from "./BoardRenderer";
import { getLines } from "./util";
import GutiManager from "./GutiManager";
import { getSocket } from "./socket";
import { SOUND_EFFECTS } from "./consts/SOUND_EFFECTS";
import { GAME_TYPE } from "./consts/GAME_TYPE";
import { LINE_LENGTH } from "./consts/Layout";

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
		backgroundColor: "#121212",
	};

	// eslint-disable-next-line no-unused-vars
	const game = new Phaser.Game(config);

	function preload() {
		this.load.audio(SOUND_EFFECTS.MOVE_GUTI, "/assets/audio/click_003.mp3");
		this.load.audio(SOUND_EFFECTS.KILL_GUTI, "/assets/audio/glass_hit_shatter_light_negative.mp3");
		this.load.image("guti", "/assets/guti/glossy_guti.png");
	}

	function create() {
		// Draw the board
		GutiManager.game_type = type;

		// Board Frame
		let boardFrame = this.add.graphics();
		boardFrame.lineStyle(4, 0x333333, 1);
		boardFrame.fillStyle(0x1a1a1a, 1);
		let frameMargin = 30;
		boardFrame.strokeRoundedRect(
			OFFSET_X - frameMargin,
			OFFSET_Y - frameMargin,
			LINE_LENGTH + frameMargin * 2,
			LINE_LENGTH + frameMargin * 2,
			20
		);
		boardFrame.fillRoundedRect(
			OFFSET_X - frameMargin,
			OFFSET_Y - frameMargin,
			LINE_LENGTH + frameMargin * 2,
			LINE_LENGTH + frameMargin * 2,
			20
		);

		let boardLines = this.add.graphics({
			lineStyle: {
				width: 2,
				color: 0x333333,
			},
		});
		boardLines.x = OFFSET_X;
		boardLines.y = OFFSET_Y;

		for (let line of getLines()) {
			boardLines.strokeLineShape(line);
		}

		// Draw node indicators (rings)
		let nodeGraphics = this.add.graphics();
		nodeGraphics.lineStyle(1, 0x444444, 0.5);
		let offset = LINE_LENGTH / 4;
		for (let row = 0; row < 5; row++) {
			for (let col = 0; col < 5; col++) {
				nodeGraphics.strokeCircle(
					OFFSET_X + col * offset,
					OFFSET_Y + row * offset,
					LINE_LENGTH * 0.03
				);
			}
		}

		if (type !== GAME_TYPE.PASS_N_PLAY) {
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
