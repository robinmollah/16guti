const GUTI_COLOR = {
    PLAYER1: "#006A4E",
    PLAYER2: "#DB7093",
    BLANK: "#111111",
    VALID: "#CC7A00"
}

let TURN = GUTI_COLOR.PLAYER1;
let NOT_TURN = function(){
	return TURN === GUTI_COLOR.PLAYER1 ? GUTI_COLOR.PLAYER2 : GUTI_COLOR.PLAYER1;
}

function updateTurn() {
	let turnElem = document.getElementById("turn");
	turnElem.style.color = TURN === GUTI_COLOR.PLAYER1 ? GUTI_COLOR.PLAYER1 : GUTI_COLOR.PLAYER2;
	turnElem.className = TURN === GUTI_COLOR.PLAYER1 ? "animateToRight" : "animateToLeft";
	turnElem.style.top = TURN === GUTI_COLOR.PLAYER1 ? "75vh" : "10vh";
	turnElem.innerText = TURN === GUTI_COLOR.PLAYER1 ? "Greens turn" : "Pinks turn";
}

function updateScore(green_score, pink_score){
	let greenScore = document.getElementById("green-score");
	let pinkScore = document.getElementById("pink-score");
	greenScore.innerText = green_score;
	pinkScore.innerText = pink_score;
}

class GutiManager {
	constructor() {
		this.start();
		this.score = {
			green: 0,
			pink: 0
		}
	}

	start(){
		GutiManager.orientation = new Array(25).fill(GUTI_COLOR.PLAYER2, 0, 10)
			.fill(GUTI_COLOR.BLANK, 10, 15)
			.fill(GUTI_COLOR.PLAYER1, 15, 25);
	}

    /**
     * 1, 0, -1 representing the sequence of gutis
     * @returns {*}
     */
    getGutiOrientation(){
        return GutiManager.orientation;
    }

    moveGuti(source, dest){
        GutiManager.orientation[dest] = GutiManager.orientation[source];
        GutiManager.orientation[source] = GUTI_COLOR.BLANK;
        this.clearSuggestions();
    }

    draw(){
        if(GutiManager.update) return
		updateTurn();

		for(let j = 1; j< 6; j++){
			document.getElementById(`row-${j}`).innerText = "";
		}

        GutiManager.update = true
        let i = 0;
        for (let guti of this.getGutiPositions()){
            let circle;
            circle = document.createElement("div");
            circle.classList.add("guti");
			circle.style.background = i === GutiManager.picked ? "#dd0000" : guti.color
            guti.i = i;
            // FIXME a lot of interactive is being set, find a way to solve this memory leak
            if(guti.color === TURN){
                circle.addEventListener('click', () => {
                	if(guti.color === TURN){
						this.showValidMoves(guti.i, this.getGutiOrientation());
						GutiManager.picked = guti.i;
						GutiManager.update = false;
						this.draw();
					}
                });

				circle.addEventListener('mouseenter', () => {
					console.log("On ", guti.i);
					if(guti.color === TURN){
						this.showValidMoves(guti.i, this.getGutiOrientation());
						GutiManager.picked = guti.i;
						GutiManager.update = false;
						this.draw();
					}
				});
            } else if(guti.color === GUTI_COLOR.VALID){
            	circle.addEventListener('click', () => {
            		console.log("picked", GutiManager.picked, "dest", guti.i);
					this.moveGuti(GutiManager.picked, guti.i);
					const diff = Math.abs(GutiManager.picked - guti.i);
					if(diff === 10
						|| diff === 2
					){
						if(TURN === GUTI_COLOR.PLAYER1){
							this.score.green++;
						} else {
							this.score.pink++;
						}
						updateScore(this.score.green, this.score.pink);
					}
					GutiManager.picked = null;
					this.flipTurn();
					GutiManager.update = false;
					this.draw();
				});
			}
            document.getElementById(`row-${(i%5) + 1}`).append(circle);
            i++;
        }
    }

    /**
     * Get geometric position of gutis
     * @param offset
     * @returns {[]}
     */
    getGutiPositions(offset = 100){
        let gutis = [];
        let row = 0;
        let column = 0;
        for (let guti of this.getGutiOrientation()){
            gutis.push({
                color: guti
            });
            if((column + 1) % 5 === 0) {
                row++;
                column = 0;
                continue;
            }
            column++;
        }
        return gutis;
    }


    /**
     * Valid moves of a guti in index position
     * @param index
     * @returns {[]}
     */
    possibleMoves(index){
        let matrixCord = convertToMatrixCoord(index);
        let validMoves = [];
        let row = matrixCord[0];
        let column = matrixCord[1];

        // Cross
        validMoves.push([row, column + 1]);
        validMoves.push([row, column - 1]);
        validMoves.push([row + 1, column]);
        validMoves.push([row - 1, column]);

        // Diags
        if((row % 2 === 0 && column % 2 === 0)
            || (row % 2 !== 0 && column % 2 !== 0)){
            validMoves.push([row + 1, column + 1]);
            validMoves.push([row + 1, column - 1]);
            validMoves.push([row - 1, column - 1]);
            validMoves.push([row - 1, column + 1])
        }

        validMoves = validMoves.map((value) =>{
        	// boundary check
			if(inBound(value[0]) && inBound(value[1]))
				return convertToOrientation(value[0], value[1])
			else
				return -1;
		});
        let additionalMoves = [];
        validMoves = validMoves.filter(function(idx){
        	// Must be on empty place
        	if(!GutiManager.isBlank(idx)){
				if(GutiManager.orientation[idx] === NOT_TURN()){
					// Got contact with a guti of opponent

					let me = rowColumnOfMat(index);
					let opponent = rowColumnOfMat(idx);
					if(me.col === opponent.col){
						// Same column
						if(me.row < opponent.row){
							// My guti is below opponents guti
							if(GutiManager.isBlank(convertToOrientation(opponent.row + 1, me.col))){
								// valid move is above opponent
								additionalMoves.push(convertToOrientation(opponent.row + 1 , me.col));
							}
						}
						else if(me.row > opponent.row) {// My guti is above opponents guti
							if(GutiManager.isBlank(convertToOrientation(opponent.row - 1, me.col))){
								// valid move is below opponent
								additionalMoves.push(convertToOrientation(opponent.row - 1, me.col));
							}
						}
					} else if(me.row === opponent.row){
						// same row
						if(me.col > opponent.col){
							// Opp is in right side
							if(GutiManager.isBlank(convertToOrientation(me.row, opponent.col -1))){
								additionalMoves.push(convertToOrientation(me.row, opponent.col - 1));
							}
						} else if(me.col < opponent.col){
							// Opp is in left side
							if(GutiManager.isBlank(convertToOrientation(me.row, opponent.col +1))){
								additionalMoves.push(convertToOrientation(me.row, opponent.col + 1));
							}
						}


					}

					return false;
				}
			}

        	// Must be blank position to avoid putting on top of another GUTI
        	return GutiManager.orientation[idx] === GUTI_COLOR.BLANK ? idx : false
		});
		validMoves.push(...additionalMoves);
		return validMoves;
    }

	/**
	 * If the position is blank in the given index
	 * @param index
	 * @returns {boolean|*}
	 */
	static isBlank(index){
        return GutiManager.orientation[index] !== GUTI_COLOR.BLANK ? false : index;
    }

	flipTurn(){
    	TURN = TURN === GUTI_COLOR.PLAYER1 ? GUTI_COLOR.PLAYER2 : GUTI_COLOR.PLAYER1;
	}

    /**
     * Updates the orientation of board to show the valid moves
     * @param index
     */
    showValidMoves(index){
    	this.clearSuggestions();
        for(let validMove of this.possibleMoves(index)){
            GutiManager.orientation[validMove] = GUTI_COLOR.VALID;
        }
    }

    clearSuggestions(){
		GutiManager.orientation = GutiManager.orientation.map((value)=>{
			if(value === GUTI_COLOR.VALID) return GUTI_COLOR.BLANK;
			else return value;
		});
	}
}



/**
 * Convert orientation index to matrix corientation indices
 * For example: 9 -> 1, 4
 */
 function convertToMatrixCoord(index){
	return [Math.floor(index / 5), index % 5];
}

 function rowColumnOfMat(index){
	return {
		"row": Math.floor(index/5),
		"col": index % 5
	}
}

/**
 * Convert matrix indices to orientation index
 * @param row
 * @param column
 * @returns {*}
 */
 function convertToOrientation(row, column){
	return row * 5 + column;
}

 function inBound(value){
	return value >= 0 && value < 5;
}
