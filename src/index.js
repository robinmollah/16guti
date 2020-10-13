import Phaser from "phaser";
import logoImg from "./assets/logo.png";

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
let graphics, lines;

function preload() {
  this.load.image("logo", logoImg);
}

function create() {
  // const logo = this.add.image(400, 150, "logo");

  // this.tweens.add({
  //   targets: logo,
  //   y: 450,
  //   duration: 2000,
  //   ease: "Power2",
  //   yoyo: true,
  //   loop: -1
  // });

  graphics = this.add.graphics({
    lineStyle: {
      width: 4,
      color: 0x00ff00
    }
  });

  lines = createLines();
  for(let line of lines){
    graphics.strokeLineShape(line);
  }
}

function update(){
  // Phaser.Geom.Line.Rotate(line, 0.02);
  // graphics.clear();
  // graphics.strokeLineShape(line);
}

function createLines(){
  const OFFSET = 70;
  const TOP_PAD = 90;
  const TOP_OFFSET = OFFSET + TOP_PAD;
  const LINE_LENGTH = 400;
  let lines = [];

  // corner joining lines
  lines.push(new Phaser.Geom.Line(OFFSET, OFFSET + TOP_PAD, OFFSET+ LINE_LENGTH, OFFSET + LINE_LENGTH + TOP_PAD));
  lines.push(new Phaser.Geom.Line(OFFSET, OFFSET + LINE_LENGTH + TOP_PAD, OFFSET + LINE_LENGTH, TOP_OFFSET));

  // diagonal lines
  lines.push(new Phaser.Geom.Line(OFFSET + LINE_LENGTH / 2, TOP_OFFSET + LINE_LENGTH,
      OFFSET+ LINE_LENGTH, TOP_OFFSET + LINE_LENGTH / 2));
  lines.push(new Phaser.Geom.Line(OFFSET + LINE_LENGTH / 2, TOP_OFFSET + LINE_LENGTH, OFFSET, TOP_OFFSET + LINE_LENGTH / 2));
  lines.push(new Phaser.Geom.Line(OFFSET + LINE_LENGTH / 2, TOP_OFFSET, OFFSET + LINE_LENGTH, TOP_OFFSET + LINE_LENGTH / 2));
  lines.push(new Phaser.Geom.Line(OFFSET + LINE_LENGTH / 2, TOP_OFFSET, OFFSET, TOP_OFFSET + LINE_LENGTH / 2));

  let dividend = LINE_LENGTH / 5 + TOP_OFFSET / 8;
  for(let i = 0; i < 5; i++){
    lines.push(new Phaser.Geom.Line(OFFSET, TOP_OFFSET + (dividend * i), OFFSET + LINE_LENGTH, TOP_OFFSET + (dividend * i)));
    lines.push(new Phaser.Geom.Line(OFFSET + (dividend * i), TOP_OFFSET, OFFSET + (dividend * i), TOP_OFFSET + LINE_LENGTH));
    // TODO vertical lines
  }


  return lines;
}