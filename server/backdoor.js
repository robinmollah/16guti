const matchmaker = require("./matchmaker");
const PORT = 8305;

function startBackDoorServer(sslOptions) {
  let backdoorClients = new Map();
  let app_backdoor = require("express")();
  let http_backdoor = require("http").Server(app_backdoor);
  let backdoorServer = require("socket.io")(http_backdoor, {
    path: "/socket",
  });

  backdoorServer.on("connection", function (socket) {
    socket.send(
      "you are connected to io_backDoorServer   as io_backDoorClients id:"
    );

    backdoorClients.set(socket, {});
    console.log(`io_backDoorClients.size ` + backdoorClients.size);
    socket.on("nextTurn", function (obj) {
      console.log("SS--> io_backDoorServer nextTurn: ", obj);

      matchmaker.notifyPartner(obj);
    });

    socket.on("updateVisualData", function (obj) {
      console.log("SS--> io_backDoorServer nextTurn: ", obj);

      for (const [key, entry] of backdoorClients.entries()) {
        if (key.id !== socket.id) key.emit("updateVisualData", obj);
      }
    });

    function removeFromio_backDoorClients(socket) {
      console.log("---111 removeFromio_backDoorClients:", backdoorClients.size);

      for (const [key, entry] of backdoorClients.entries()) {
        //console.log(entry);
        console.log("entry.socket.id:  " + key.id);
        console.log("socket.id:  " + socket.id);
        if (key.id == socket.id) {
          backdoorClients.delete(key);
          console.log(
            "---2222 removeFromio_backDoorClients:" + backdoorClients.size
          );
          return;
        }
      }
    }

    socket.on("disconnect", function (reason) {
      console.log("io_backDoorServer disconnected : ", backdoorClients.size);

      console.log("disconnect reason: ", reason);

      removeFromio_backDoorClients(socket);
    });

    //????????????????????????????????????????????????????
    socket.on("error", (error) => {
      console.log("io_backDoorServer reconnect_error : ", error);
      removeFromio_backDoorClients(socket);
    });

    socket.on("connect", () => {
      console.log("io_backDoorServer connect");
    });

    socket.on("connect_timeout", (timeout) => {
      console.log("io_backDoorServer connect_timeout: ", timeout);
      removeFromio_backDoorClients(socket);
    });

    socket.on("connect_error", (error) => {
      console.log("io_backDoorServer connect_error: ", error);
      removeFromio_backDoorClients(socket);
    });

    //Fired upon a successful reconnection.
    socket.on("reconnect", (attemptNumber) => {
      console.log(
        "io_backDoorServer reconnect attemptNumber: " + attemptNumber
      );
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(
        "io_backDoorServer reconnect_attempt attemptNumber: " + attemptNumber
      );
    });

    socket.on("reconnecting", (attemptNumber) => {
      console.log(
        "io_backDoorServer reconnecting attemptNumber: " + attemptNumber
      );
    });

    socket.on("reconnect_error", (error) => {
      console.log("io_backDoorServer reconnect_error : ", error);
      removeFromio_backDoorClients(socket);
    });

    socket.on("reconnect_failed", () => {
      console.log("io_backDoorServer reconnect_failed  ");
      removeFromio_backDoorClients(socket);
    });

    socket.on("ping", () => {
      console.log("io_backDoorServer ping ");
    });

    socket.on("pong", (latency) => {
      console.log("io_backDoorServer pong latency: ", latency);
    });
  });

  http_backdoor.listen(PORT, function () {
    console.log(" listening on *:" + PORT + " AS backDoorPort4_io");
  });
}

module.exports.start = startBackDoorServer;
