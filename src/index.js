import { initiateGame } from "./game";
import { getSocket } from "./socket";
// import logoImg from "./assets/logo.png";
export const LINE_LENGTH = 450;

// let name = localStorage.getItem("name");
const prompt1 = document.getElementById("prompt-1");
if (name && name.length > 0) {
  // prompt1.style.display = "none";
  // initiateGame();
} else {
  let submit = document.getElementById("submit");
  let name = document.getElementById("username");
  let waiting = document.getElementById("waiting");
  submit.addEventListener("click", () => {
    // localStorage.setItem("name", name.value);
    prompt1.style.display = "none";
    waiting.style.display = "block";
    getSocket().emit("initiate", {
      name: name.value,
    });
    // initiateGame();
  });
}
