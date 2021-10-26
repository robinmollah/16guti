let ROOM = {};
let PLAYER_COUNT = 0;
let WAITING_ROOM = {};

module.exports.enterWaitingRoom = function (name, socket) {
  WAITING_ROOM[name] = socket;

  console.log("WAITING ROOM", Object.keys(WAITING_ROOM), "ROOM", ROOM.length);
};

module.exports.createRoom = (room_name, name, socket) => {
  let last_waiting_partner_name = Object.keys(WAITING_ROOM).pop();
  let waiting_partner = WAITING_ROOM[last_waiting_partner_name];
  delete WAITING_ROOM[last_waiting_partner_name];
  ROOM[room_name] = {
    player1: waiting_partner,
    player2: socket,
  };
  socket.emit("ROOM_CREATED", {
    name: last_waiting_partner_name,
  });
  waiting_partner.emit("ROOM_CREATED", {
    name: name,
  });
  console.log(Object.keys(ROOM));
};

module.exports.exitWaitingRoom = function (name) {
  delete WAITING_ROOM[name];
};

module.exports.initiate = function initiate(socket) {};

module.exports.notifyPartner = function (room, object) {
  // socket.emit("yourTurn", object);
};

module.exports.waiting_room = WAITING_ROOM;
module.exports.room = ROOM;
