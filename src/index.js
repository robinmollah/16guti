import Phaser from "phaser";
import GutiManager from "./GutiManager";
// import logoImg from "./assets/logo.png";
const LINE_LENGTH = 400;
const OFFSET = 100;

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 600,
  height: 800,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let boardLines;

function preload() {
  // this.load.image("logo", logoImg);
}

function create() {
  // Draw the board
  boardLines = this.add.graphics({
    lineStyle: {
      width: 4,
      color: 0x00ff00
    }
  });
  boardLines.x = OFFSET;
  boardLines.y = OFFSET;

  for(let line of getLines()){
    boardLines.strokeLineShape(line);
  }

  // Draw the gutis
  GutiManager.draw(this);

  console.log(GutiManager.getGutis());
}

function update(){
  // Phaser.Geom.Line.Rotate(line, 0.02);
  // graphics.clear();
  // graphics.strokeLineShape(line);
}

function getLines(){
  let lines = [];

  // corner joining lines
  lines.push(new Phaser.Geom.Line(0, 0, LINE_LENGTH, LINE_LENGTH));
  lines.push(new Phaser.Geom.Line(0, LINE_LENGTH, LINE_LENGTH, 0));

  // diagonal lines
  lines.push(new Phaser.Geom.Line(LINE_LENGTH / 2, LINE_LENGTH,
      LINE_LENGTH, LINE_LENGTH / 2));
  lines.push(new Phaser.Geom.Line(LINE_LENGTH / 2, LINE_LENGTH, 0, LINE_LENGTH / 2));
  lines.push(new Phaser.Geom.Line(LINE_LENGTH / 2, 0, LINE_LENGTH, LINE_LENGTH / 2));
  lines.push(new Phaser.Geom.Line(LINE_LENGTH / 2, 0, 0, LINE_LENGTH / 2));

  let dividend = LINE_LENGTH / 4;
  for(let i = 0; i < 5; i++){
    lines.push(new Phaser.Geom.Line(0, (dividend * i), LINE_LENGTH, (dividend * i)));
    lines.push(new Phaser.Geom.Line((dividend * i), 0, (dividend * i), LINE_LENGTH));
    // TODO vertical lines
  }


  return lines;
}