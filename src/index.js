import Phaser from "phaser";
import GutiManager from "./GutiManager";
import { OFFSET_X, OFFSET_Y } from "./BoardRenderer";
import { getSocket } from "./socket";
// import logoImg from "./assets/logo.png";
export const LINE_LENGTH = 450;

let name = localStorage.getItem("name");
if (name && name.length > 0) {
  document.getElementById("prompt-1").style.display = "none";
  initiateGame();
} else {
  let submit = document.getElementById("submit");
  let name = document.getElementById("username");
  submit.addEventListener("click", () => {
    localStorage.setItem("name", name.value);
    document.getElementById("prompt-1").style.display = "none";
    initiateGame();
  });
}

function initiateGame() {
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

  function getLines() {
    let lines = [];

    // corner joining lines
    lines.push(new Phaser.Geom.Line(0, 0, LINE_LENGTH, LINE_LENGTH));
    lines.push(new Phaser.Geom.Line(0, LINE_LENGTH, LINE_LENGTH, 0));

    // diagonal lines
    lines.push(
      new Phaser.Geom.Line(
        LINE_LENGTH / 2,
        LINE_LENGTH,
        LINE_LENGTH,
        LINE_LENGTH / 2
      )
    );
    lines.push(
      new Phaser.Geom.Line(LINE_LENGTH / 2, LINE_LENGTH, 0, LINE_LENGTH / 2)
    );
    lines.push(
      new Phaser.Geom.Line(LINE_LENGTH / 2, 0, LINE_LENGTH, LINE_LENGTH / 2)
    );
    lines.push(new Phaser.Geom.Line(LINE_LENGTH / 2, 0, 0, LINE_LENGTH / 2));

    let dividend = LINE_LENGTH / 4;
    for (let i = 0; i < 5; i++) {
      lines.push(
        new Phaser.Geom.Line(0, dividend * i, LINE_LENGTH, dividend * i)
      );
      lines.push(
        new Phaser.Geom.Line(dividend * i, 0, dividend * i, LINE_LENGTH)
      );
      // TODO vertical lines
    }

    return lines;
  }
}
