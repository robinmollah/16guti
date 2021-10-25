import { initiateGame } from "./game";
// import logoImg from "./assets/logo.png";
export const LINE_LENGTH = 450;

let name = localStorage.getItem("name");
if (name && name.length > 0) {
  document.getElementById("prompt-1").style.display = "none";
  initiateGame();
} else {
  let submit = document.getElementById("submit");
  let name = document.getElementById("username");
  let waiting = document.getElementById("waiting");
  submit.addEventListener("click", () => {
    localStorage.setItem("name", name.value);
    document.getElementById("prompt-1").style.display = "none";
    document.getElementById("waiting").style.display = "block";
    // initiateGame();
  });
}
