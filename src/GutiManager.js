import {OFFSET_X, OFFSET_Y} from "./BoardRenderer";

const OWN_GUTI_COLOR = 0x006a4e;
const OPP_GUTI_COLOR = 0xDB7093;

class GutiManager {
    /**
     * 1, 0, -1 representing the sequence of gutis
     * @returns {*}
     */
    getGutiOrientation(){
        let gutis = new Array(25).fill(-1, 0, 10)
            .fill(0, 10, 15)
            .fill(1, 15, 25);
        return gutis;
    }

    draw(board){
        let radius = 8;
        for (let guti of this.getGutiPositions()){
            if(guti.isOwn){
                let circle = board.add.circle(guti.x, guti.y, radius, OWN_GUTI_COLOR);
                circle.setInteractive().once('pointerdown', () => {
                    console.log("Listened", guti.x, guti.y);
                });
            } else {
                let circle = board.add.circle(guti.x, guti.y, radius, OPP_GUTI_COLOR);
                circle.setInteractive().once('pointerdown', () => {
                    console.log("Listened", guti.x, guti.y);
                });
            }
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
            if(guti){
                gutis.push({
                    x: OFFSET_X + column * 100,
                    y: OFFSET_Y + row * 100,
                    isOwn: guti == 1
                });
            }
            if((column + 1) % 5 == 0) {
                console.log("Increasng row")
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