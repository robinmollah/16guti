let ROOM = {};
let PLAYER_COUNT = 0;
/**
 *
 * @type {{name: Socket}}
 */
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
		partner_id: socket.id,
		room_name: room_name,
		turn: 1,
	});
	waiting_partner.emit("ROOM_CREATED", {
		name: name,
		partner_id: waiting_partner.id,
		room_name: room_name,
		turn: 0,
	});
	console.log("Room details", Object.keys(ROOM));
};

module.exports.exitWaitingRoom = function (name) {
	console.log("exiting waiting room ", name);
	delete WAITING_ROOM[name];
};

module.exports.initiate = function initiate(socket) {};

module.exports.notifyPartner = function (object, socket_id) {
	// socket.emit("yourTurn", object);
	getPartnersSocket(object.room, socket_id).emit("yourTurn", object);
};

function getPartnersSocket(room, own_socket_id) {
	let player1socket = ROOM[room].player1;
	let player2socket = ROOM[room].player2;
	console.log("socket ids", player2socket.id, player1socket.id, own_socket_id);
	if (player1socket.id === own_socket_id) {
		return player2socket;
	} else {
		return player1socket;
	}
}
module.exports.waiting_room = WAITING_ROOM;
module.exports.room = ROOM;
