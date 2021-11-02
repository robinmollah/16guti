import { initiateGame } from "./game";
import { getSocket } from "./socket";
// import logoImg from "./assets/logo.png";
export const LINE_LENGTH = 450;

const submit = document.getElementById("submit");
const name = document.getElementById("username");
const waiting = document.getElementById("waiting");
const game_play = document.getElementById("game_play");
const partner_name = document.getElementById("partner-name");
const pass_n_play = document.getElementById("pass_n_play");

pass_n_play.addEventListener("click", () => {
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
      initiateGame("online");
    });
  });
}
