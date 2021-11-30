import io from "socket.io-client";

let ss_initialized = false;
let ioClient4SS;

export function getSocket() {
  if (ss_initialized) {
    return ioClient4SS;
  }
  ss_initialized = true;

  ioClient4SS = io("http://127.0.0.1:8305", {
    path: "/socket",
  });

  ioClient4SS.on("message", function (message) {
    console.log(`Message received from server(${ioClient4SS.id}):  ${message}`);
  });

  ioClient4SS.on("connect", function () {
    console.log(`5. ON Connect Event: ----ioClient4SS.id:  ${ioClient4SS.id}`);
    toast_alert("Connected to server", {
      color: "green",
      timeout: 1500,
    });
  });

  ioClient4SS.on("yourTurn", function (data) {
    // if (data.room !== "ROOM_NAME") return;
    console.log("yourTurn: " + JSON.stringify(data));
    // window.gutiManager.moveGuti(data.src, data.dest);
    // window.gutiManager.killHandler(data.src, data.dest);
    // window.gutiManager.flipTurn();
    // GutiManager.update = false;
    // window.gutiManager.draw();
  });

  ioClient4SS.on("disconnect", (reason) => {
    console.log(`ioClient4SS: disconnect: ${reason}`);
  });

  ioClient4SS.on("connect_error", function (error) {
    console.log(`connect_error: ${error}`);
    toast_alert(
      `Server is not available. Please try again later. ${error.type}`
    );
  });

  ioClient4SS.on("connect_timeout", function (message) {
    console.log("connect_timeout: " + message);
  });

  ioClient4SS.on("error", function (error) {
    console.log(`error: ${error}`);
  });
  return ioClient4SS;
}
