let ioClient4SS;

function startServingTo(ipaddrerss, port) {
	console.log("2. connect to: http://" + ipaddrerss + ":" + port);
	ioClient4SS = io.connect(
		"http://" + ipaddrerss + ":" + port
		// , {withCredentials: false}
		//, {secure: true}
	);

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

startServingTo(window.location.hostname, 8305);
