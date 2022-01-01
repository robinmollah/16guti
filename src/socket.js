import io from "socket.io-client";

let ss_initialized = false;
let ioClient4SS;

export function getSocket() {
	if (ss_initialized) {
		return ioClient4SS;
	}
	ss_initialized = true;
	let serverAddress = PROCESS_ENV.NODE_ENV === "production" ? "https://10guti.properbd.net": "http://127.0.0.1:8305";
	ioClient4SS = io(serverAddress, {
		path: "/socket",
	});

	ioClient4SS.on("message", function (message) {
		console.log(`Message received from server(${ioClient4SS.id}):  ${message}`);
	});

	ioClient4SS.on("connect", function () {
		console.log(`5. ON Connect Event: ----ioClient4SS.id:  ${ioClient4SS.id}`);
		// eslint-disable-next-line no-undef
		toast_alert("Connected to server", {
			color: "green",
			timeout: 1500,
		});
	});

	ioClient4SS.on("disconnect", (reason) => {
		console.log(`ioClient4SS: disconnect: ${reason}`);
	});

	ioClient4SS.on("connect_error", function (error) {
		console.log(`connect_error: ${error}`);
		// eslint-disable-next-line no-undef
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
