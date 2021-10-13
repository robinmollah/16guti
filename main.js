require('dotenv').config();
const DEBUG = process.env.environment === "DEVELOPMENT";
const path = require("path");
const open = require("open");
const backdoor = require("./src/backdoor.js");
const PORT = 8090;

const express = require("express");
const app = express();
let rooms = {};

const http2 = require('http').Server(app);

function startServerListening(httpServer, port, logName) {
	httpServer.on("error", function (e) {
		// do your thing
		console.log(logName + " error : " + e);
		console.log(logName + " exiting the process  ");
		process.exit(0);
	});

	httpServer.listen(port, function () {
		console.log(logName + " listening on *: " + port);
		if(DEBUG){}
			// open("http://127.0.0.1:" + port);
	});
}

startServerListening(http2, PORT, "http2");
app.set("view engine", 'ejs');

app.use("/scripts", express.static(path.join(__dirname, "/scripts")));
backdoor.start();

app.get("/:room", function (req, res) {
	const room_name = req.params.room;
	if (rooms[room_name]) {
		// you are player 2
		if (rooms[room_name].player === 2) {
			res.json({error: "This room is full. Open spectator mode or a different room."});
			return;
		} else {
			rooms[room_name].player = 2;
		}
	} else {
		// you are player 1
		rooms[room_name] = {
			player: 1
		}
	}
	let player_id = rooms[room_name].player;
	res.render('game-play', {player_id, rooms, room_name, DEBUG});
});
console.log("Rooms: ", rooms);

app.get("/", function (req, res) {
	res.render('index', {debug: DEBUG});
});
