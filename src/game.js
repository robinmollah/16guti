import Phaser from "phaser";
import { OFFSET_X, OFFSET_Y } from "./BoardRenderer";
import { getLines } from "./util";
import GutiManager from "./GutiManager";
import { getSocket } from "./socket";

export function initiateGame() {
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
    getSocket();
  }

  function update() {
    // Phaser.Geom.Line.Rotate(line, 0.02);
    // graphics.clear();
    // graphics.strokeLineShape(line);
    GutiManager.draw(this);
  }
}
