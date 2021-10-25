let ROOM = [];
let PLAYER_COUNT = 0;
let WAITING_ROOM = {};

module.exports.enterWaitingRoom = function (name, socket) {
  WAITING_ROOM[name] = socket;

  console.log("WAITING ROOM", Object.keys(WAITING_ROOM), "ROOM", ROOM.length);
};

module.exports.exitWaitingRoom = function (name) {
  delete WAITING_ROOM[name];
};

module.exports.initiate = function initiate(socket) {};

module.exports.notifyPartner = function (room, object) {
  // socket.emit("yourTurn", object);
};

module.exports.waiting_room = Object.keys(WAITING_ROOM);
