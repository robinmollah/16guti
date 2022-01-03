let turn_indicator_bug = document.getElementById("turn_indicator_bg");
let turn_indicator = document.getElementById("turn_indicator");

/**
 *
 * @param {Number} value
 */
// eslint-disable-next-line no-unused-vars
function setTurnProgress(value){
	turn_indicator_bug.style.width = (29 * value) + "%";
}

let interval;
function startTurnCountdown(){
	turn_indicator_bug.style.padding= "1em";
	let i = 0;
	clearInterval(interval);
	interval = setInterval(() => {
		i +=2;
		if(i >= 100) clearInterval(interval);
		setTurnProgress(i / 100);
	}, 150);
}

function flipTurnText(){
	turn_indicator.innerText = turn_indicator.innerText === "Your Turn" ? "Opponents Turn" : "Your Turn";
}
