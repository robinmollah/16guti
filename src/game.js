import Phaser from "phaser";
import { OFFSET_X, OFFSET_Y } from "./BoardRenderer";
import { getLines } from "./util";
import GutiManager from "./GutiManager";
import { getSocket } from "./socket";

/**
 *
 * @param {'pass_n_play'|'vs_computer'|'online'|'with_friends'} type
 * @param {String} partner_id
 * @param {String} room_name
 */
export function initiateGame(type, partner_id, room_name) {
  const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 600,
    height: 800,
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
    backgroundColor: "#b76f20",
  };

  const game = new Phaser.Game(config);

  function preload() {
    // this.load.image("logo", logoImg);
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

    // export button
    const exportButton = this.add.text(config.width - 95, 50, "export", {
      fill: "#0f0",
    });
    exportButton.setInteractive().on("pointerdown", () => {
      console.log("Exporting");
      GutiManager.exportGameState();
    });
    let current = this;
    if (type !== "pass_n_play") {
      GutiManager.setPartnerId(partner_id);
      GutiManager.setRoomName(room_name);
      let socket = getSocket();
      window.GutiManager = GutiManager;
      socket.on("yourTurn", (data) => {
        console.log("yourTurn: " + JSON.stringify(data), GutiManager);
        GutiManager.moveGuti(data.src, data.dest);
        GutiManager.killHandler(data.src, data.dest);
        GutiManager.flipTurn();
        GutiManager.update();
      });
    }
  }

  function update() {
    // Phaser.Geom.Line.Rotate(line, 0.02);
    // graphics.clear();
    // graphics.strokeLineShape(line);
    GutiManager.draw(this);
  }
}
