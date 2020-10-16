let GutiStyle = {
    lineStyle: {
        width: 4,
        color: 0xff0000
    },
    fillStyle: {
        color: 0x00ff00
    }
};

class GutiManager {
    getGutis(){
        let gutis = new Array(25).fill(-1, 0, 10)
            .fill(0, 10, 15)
            .fill(1, 15, 25);
        return gutis;
    }

    draw(graphics){
        graphics = graphics.add.graphics(GutiStyle);
        for (let guti of this.getGutiShapes()){
            graphics.fillCircleShape(guti)
        }
    }

    getGutiShapes(){
        let gutis = [];
        for (let guti in this.getGutis()){
            gutis.push(new Phaser.Geom.Circle(Math.random() * 300, Math.random() * 200, 7))
        }
        return gutis;
    }
}

export default new GutiManager()