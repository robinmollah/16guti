let ROOM = [];
let PLAYER_COUNT = 0;

module.exports.initiate = function initiate(socket) {
  let ROOM_ID;
  if (PLAYER_COUNT % 2 === 0) {
    ROOM_ID = PLAYER_COUNT;
    ROOM.push({
      player1: {
        socket: socket,
        name: "robin",
      },
    });
  } else {
    ROOM_ID = Math.floor(PLAYER_COUNT / 2);
    ROOM[ROOM_ID].player2 = {
      socket: socket,
      name: "robin",
    };
  }
  PLAYER_COUNT++;
  return ROOM_ID;
};

module.exports.notifyPartner = function (room, object) {
  // socket.emit("yourTurn", object);
};
