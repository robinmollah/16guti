import {OFFSET_X, OFFSET_Y} from "./BoardRenderer";

const GUTI_VAL = {
    OWN: 1,
    OPP: -1,
    VALID: -2,
    BLANK: 0,
}

const GUTI_COLOR = {
    OWN: 0x006A4E,
    OPP: 0xDB7093,
    BLANK: 0x111111,
    VALID: 0xCC7A00
}

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
    }

    matrix(){
        let matrix = [];
        for(let i = 0; i < 5; i++){
            matrix.push(GutiManager.orientation.slice(5 * i, 5 + (5 * i)));
        }
        return matrix;
    }

    draw(board){
        if(GutiManager.update) return
        GutiManager.update = true
        let radius = GUTI_RADIUS;
        let i = 0;
        for (let guti of this.getGutiPositions()){
            let circle;
            circle = board.add.circle(guti.x, guti.y, radius, guti.color);
            guti.i = i;
            if(guti.color === GUTI_COLOR.OWN || guti.color === GUTI_COLOR.OPP){
                circle.setInteractive().once('pointerdown', () => {
                    // this.moveGuti(guti.i, guti.color === GUTI_COLOR.OWN ? guti.i - 7 : guti.i + 6);
                    this.matrix();
                    this.showValidMoves(guti.i, this.getGutiOrientation());

                    GutiManager.update = false;
                });
            }
            GutiManager.objects[i] = circle;
            i++;
        }
        console.log("Orientation", GutiManager.orientation);
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
     * Convert orientation index to matrix corientation indices
     * For example: 9 -> 1, 4
     */
    convertToMatrixCoord(index){
        return [Math.floor(index / 5), index % 5];
    }

    /**
     * Convert matrix indices to orientation index
     * @param row
     * @param column
     * @returns {*}
     */
    convertToOrientation(row, column){
        return row * 5 + column;
    }

    /**
     * Valid moves of a guti in index position
     * @param index
     * @returns {[]}
     */
    possibleMoves(index){
        let matrixCord = this.convertToMatrixCoord(index);
        let validMoves = [];
        let row = matrixCord[0];
        let column = matrixCord[1];

        // Cross
        validMoves.push(
            this.convertToOrientation(row, column + 1)
        );
        validMoves.push(
            this.convertToOrientation(row, column - 1)
        );
        validMoves.push(
            this.convertToOrientation(row+1, column)
        );
        validMoves.push(
            this.convertToOrientation(row - 1, column)
        );

        // Diags
        validMoves.push(
            this.convertToOrientation(row+1, column + 1)
        );
        validMoves.push(
            this.convertToOrientation(row + 1, column - 1)
        );
        validMoves.push(
            this.convertToOrientation(row - 1, column -1 )
        );
        validMoves.push(
            this.convertToOrientation(row - 1, column + 1)
        )

        // TODO filter guti occupied
        // TODO filter out of bound
        validMoves = validMoves.filter(this.isBlank)
        console.log(validMoves);
        return validMoves;
    }

    isBlank(index){
        return GutiManager.orientation[index] !== GUTI_COLOR.BLANK ? false : index;
    }

    /**
     * Updates the orientation of board to show the valid moves
     * @param index
     */
    showValidMoves(index){
        // TODO clear previous suggestions
        GutiManager.orientation = GutiManager.orientation.map((value)=>{
            if(value === GUTI_COLOR.VALID) return GUTI_COLOR.BLANK;
            else return value;
        });
        for(let validMove of this.possibleMoves(index)){
            GutiManager.orientation[validMove] = GUTI_COLOR.VALID;
        }
    }
}

export default new GutiManager()