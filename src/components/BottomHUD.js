export class BottomHUD {
    constructor(scene) {
        this.scene = scene;
    }

    draw() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const bottomY = height - 60;

        // Bottom Bar Background
        const bottomBar = this.scene.add.graphics();
        bottomBar.fillStyle(0x1a1a1a, 0.9);
        bottomBar.fillRoundedRect(width * 0.05, bottomY - 30, width * 0.9, 60, 30);
        bottomBar.lineStyle(1, 0x333333, 1);
        bottomBar.strokeRoundedRect(width * 0.05, bottomY - 30, width * 0.9, 60, 30);

        // Buttons styling
        const btnStyle = {
            fontFamily: "Outfit, Arial",
            fontSize: "16px",
            color: "#aaaaaa",
            fontStyle: "bold"
        };

        // Placeholder buttons
        this.scene.add.text(width * 0.2, bottomY, "↺ Undo", btnStyle).setOrigin(0.5);
        this.scene.add.text(width * 0.5, bottomY, "💬 Emote", btnStyle).setOrigin(0.5);
        this.scene.add.text(width * 0.8, bottomY, "☰ Menu", btnStyle).setOrigin(0.5);

        return bottomBar;
    }
}
