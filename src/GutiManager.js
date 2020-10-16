let GutiStyle = {
    lineStyle: {
        width: 4,
        color: 0xff0000
    },
    fillStyle: {
        color: 0xDB7093
    }
};
let OFFSET = 100;

class GutiManager {
    getGutiOrientation(){
        let gutis = new Array(25).fill(-1, 0, 10)
            .fill(0, 10, 15)
            .fill(1, 15, 25);
        return gutis;
    }

    draw(graphics){
        let own = graphics.add.graphics(GutiStyle);
        GutiStyle.fillStyle.color = 0x006a4e
        let opponent = graphics.add.graphics(GutiStyle)
        opponent.x = OFFSET;
        opponent.y = OFFSET;
        own.x = OFFSET;
        own.y = OFFSET;

        let radius = 8;
        for (let guti of this.getGutiPositions()){
            if(guti.isOwn){
                own.fillCircle(guti.x, guti.y, radius);
            } else {
                opponent.fillCircle(guti.x, guti.y, radius);
            }
        }
    }

    getGutiPositions(offset = 100){
        let gutis = [];
        let row = 0;
        let column = 0;
        for (let guti of this.getGutiOrientation()){
            if(guti){
                gutis.push({
                    x: column * 100,
                    y: row * 100,
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