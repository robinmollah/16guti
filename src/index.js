import { initiateGame } from "./game";
import { getSocket } from "./socket";
import { GUTI_COLOR } from "./GutiManager";
// import logoImg from "./assets/logo.png";
export const LINE_LENGTH = 450;
document.body.style.display="block";

const submit = document.getElementById("submit");
const name = document.getElementById("username");
const waiting = document.getElementById("waiting");
const game_play = document.getElementById("game_play");
const partner_name = document.getElementById("partner-name");
const pass_n_play = document.getElementById("pass_n_play");
// eslint-disable-next-line no-undef
console.log("process.env", PROCESS_ENV.NODE_ENV);

pass_n_play.addEventListener("click", () => {
	prompt1.style.display = "none";
	initiateGame("pass_n_play");
});

// let name = localStorage.getItem("name");
const prompt1 = document.getElementById("prompt-1");
if (name && name.length > 0) {
	// prompt1.style.display = "none";
	// initiateGame();
} else {
	submit.addEventListener("click", () => {
		// localStorage.setItem("name", name.value);
		prompt1.style.display = "none";
		waiting.style.display = "block";
		getSocket().emit("initiate", {
			name: name.value,
		});
		getSocket().on("ROOM_CREATED", (obj) => {
			waiting.style.display = "none";
			console.log("ROOM CREATED", obj);
			game_play.style.display = "block";
			partner_name.innerText = obj.name;
			initiateGame("online", obj.partner_id, obj.room_name, obj.turn);
		});
	});
}

// dev.js

// eslint-disable-next-line no-undef
if(PROCESS_ENV.NODE_ENV.toLowerCase() === "development"){
	// eslint-disable-next-line no-undef
	$(document).ready(function() { _fillAndGo(); });
}

function _fillAndGo(){
	name.value = "robin" + Math.ceil(Math.random() * 100);
	submit.click();
}
