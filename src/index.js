import Phaser from "phaser";
import GutiManager from "./GutiManager";
import {OFFSET_X, OFFSET_Y} from "./BoardRenderer";
import io from "socket.io-client";
// import logoImg from "./assets/logo.png";
const LINE_LENGTH = 400;

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
      color: 0x444444
    }
  });
  boardLines.x = OFFSET_X;
  boardLines.y = OFFSET_Y;

  for(let line of getLines()){
    boardLines.strokeLineShape(line);
  }

  // export button
  const exportButton = this.add.text(config.width - 95, 50, 'export', {fill: '#0f0'});
  exportButton.setInteractive().on('pointerdown', () => {
    console.log("Exporting");
    GutiManager.exportGameState();
  });

  const ioClient4SS = io("http://127.0.0.1:8305", {
    path: '/socket'
  });
  ioClient4SS.on("message", function (message) {
    console.log(
      "message recieved from server( " + ioClient4SS.id + " ): " + message
    );
  });

  ioClient4SS.on("connect", function () {
    console.log("5. ON Connect Event: ----ioClient4SS.id: ", ioClient4SS.id);

    ioClient4SS.emit("sendCurrentSSLists");
  });

  ioClient4SS.on("yourTurn", function (data) {
    if (data.room != MY_ROOM_NAME) return;
    console.log("yourTurn: " + JSON.stringify(data));
    window.gutiManager.moveGuti(data.src, data.dest);
    window.gutiManager.killHandler(data.src, data.dest);
    window.gutiManager.flipTurn();
    GutiManager.update = false;
    window.gutiManager.draw();
  });

  ioClient4SS.on("disconnect", (reason) => {
    console.log("ioClient4SS: disconnect: " + reason);
    //ioClient4SS.disconnect()
    //ioClient4SS.removeAllListeners();
    //cleanSocketsWithUndefinedID();
    //removeFromioClient4Collections(ioClient4SS)

    //ioClient4SS.close()//2do-may disable  ioClient4SS.connected

    // console.log('------- ioClient4SS.connected: ',  ioClient4SS.connected);
    // console.log('------- ioClient4SS.disconnected: ',  ioClient4SS.disconnected);

    // console.log('------- ioClient4SS.connected: ',  ioClient4SS.connected);
    // console.log('------- ioClient4SS.disconnected: ',  ioClient4SS.disconnected);
  });

  ioClient4SS.on("connect_error", function (error) {
    console.log("connect_error: " + error);
  });

  ioClient4SS.on("connect_timeout", function (message) {
    console.log("connect_timeout: " + message);
  });

  ioClient4SS.on("error", function (error) {
    console.log("error: " + error);
  });

}

function update(){
  // Phaser.Geom.Line.Rotate(line, 0.02);
  // graphics.clear();
  // graphics.strokeLineShape(line);
  GutiManager.draw(this);
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
