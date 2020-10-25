import {OFFSET_X, OFFSET_Y} from "./BoardRenderer";

const OWN_GUTI_COLOR = 0x006a4e;
const OPP_GUTI_COLOR = 0xDB7093;
const BLANK_GUTI_COLOR = 0x111111;

const OWN_GUTI_VALUE = 1;
const OPP_GUTI_VALUE = -1;

const GUTI_RADIUS = 8;

class GutiManager {
    /**
     * 1, 0, -1 representing the sequence of gutis
     * @returns {*}
     */
    getGutiOrientation(){
        if(!GutiManager.oriented){
            let gutis = new Array(25).fill(OPP_GUTI_VALUE, 0, 10)
                .fill(0, 10, 15)
                .fill(OWN_GUTI_VALUE, 15, 25);
            GutiManager.orientation = gutis;
            GutiManager.objects = {...gutis};
            GutiManager.oriented = true;
        }
        return GutiManager.orientation;
    }

    moveGuti(source, dest){
        // TODO do the same for gutiObjects
        GutiManager.orientation[dest] = GutiManager.orientation[source];
        GutiManager.orientation[source] = 0;
    }

    matrix(){
        let matrix = [];
        for(let i = 0; i < 5; i++){
            matrix.push(GutiManager.orientation.slice(5 * i, 5 + (5 * i)));
        }
        console.log(matrix);
        return matrix;
    }

    draw(board){
        if(GutiManager.update) return
        GutiManager.update = true
        let radius = GUTI_RADIUS;
        let i = 0;
        for (let guti of this.getGutiPositions()){
            let circle;
            if(guti.isOwn){
                circle = board.add.circle(guti.x, guti.y, radius, OWN_GUTI_COLOR);
                circle.setInteractive().once('pointerdown', () => {
                    console.log("Listened", guti.x, guti.y);
                    GutiManager.update = false;
                });
            } else {
                circle = board.add.circle(guti.x, guti.y, radius, guti.blank ? BLANK_GUTI_COLOR : OPP_GUTI_COLOR);
                guti.i = i;
                circle.setInteractive().once('pointerdown', () => {
                    console.log("Listened", guti.x);
                    this.moveGuti(guti.i, guti.i + 7);
                    GutiManager.update = false;
                    this.matrix();
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
                isOwn: guti === 1,
                blank: guti === 0
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
}

export default new GutiManager()