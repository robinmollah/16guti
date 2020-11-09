import {OFFSET_X, OFFSET_Y} from "./BoardRenderer";
import {convertToMatrixCoord, convertToOrientation, inBound} from "./Validity";

const GUTI_COLOR = {
    OWN: 0x006A4E,
    OPP: 0xDB7093,
    BLANK: 0x111111,
    VALID: 0xCC7A00
}

let TURN = GUTI_COLOR.OWN;

const GUTI_RADIUS = 8;

class GutiManager {
    /**
     * 1, 0, -1 representing the sequence of gutis
     * @returns {*}
     */
    getGutiOrientation(){
        if(!GutiManager.oriented){
            let gutis = new Array(25).fill(GUTI_COLOR.OPP, 0, 10)
                .fill(GUTI_COLOR.BLANK, 10, 15)
                .fill(GUTI_COLOR.OWN, 15, 25);
            GutiManager.orientation = gutis;
            GutiManager.objects = {...gutis};
            GutiManager.oriented = true;
        }
        return GutiManager.orientation;
    }

    moveGuti(source, dest){
        // TODO do the same for gutiObjects
        GutiManager.orientation[dest] = GutiManager.orientation[source];
        GutiManager.orientation[source] = GUTI_COLOR.BLANK;
        this.clearSuggestions();
    }

    draw(board){
        if(GutiManager.update) return
        GutiManager.update = true
        let radius = GUTI_RADIUS;
        let i = 0;
        for (let guti of this.getGutiPositions()){
            let circle;
            circle = board.add.circle(guti.x, guti.y, radius, i === GutiManager.picked ? 0xdd0000 : guti.color);
            guti.i = i;
            // FIXME a lot of interactive is being set, find a way to solve this memory leak
            if(guti.color === TURN){
                circle.setInteractive().once('pointerdown', () => {
                	if(guti.color === TURN){
						this.showValidMoves(guti.i, this.getGutiOrientation());
						GutiManager.picked = guti.i;
						GutiManager.update = false;
					}
                });
            } else if(guti.color === GUTI_COLOR.VALID){
            	circle.setInteractive().once('pointerdown', () => {
					this.moveGuti(GutiManager.picked, guti.i);
					GutiManager.picked = null;
					this.flipTurn();
					GutiManager.update = false;
				});
			}
            GutiManager.objects[i] = circle;
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
                x: OFFSET_X + column * 100,
                y: OFFSET_Y + row * 100,
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
        validMoves = validMoves.filter(this.isBlank)
        return validMoves;
    }

    isBlank(index){
        return GutiManager.orientation[index] !== GUTI_COLOR.BLANK ? false : index;
    }

	flipTurn(){
    	TURN = TURN === GUTI_COLOR.OWN ? GUTI_COLOR.OPP : GUTI_COLOR.OWN;
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

export default new GutiManager()
