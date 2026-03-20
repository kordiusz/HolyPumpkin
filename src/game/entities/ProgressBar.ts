export class ProgressBar extends Phaser.GameObjects.Container {
    private bar: Phaser.GameObjects.Graphics;
    private label: Phaser.GameObjects.Text;
    private readonly barWidth: number = 60;
    private readonly barHeight: number = 8;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);


        this.label = scene.add.text(0, -12, 'Planting...', {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.bar = scene.add.graphics(); // Changed from scene.make
        this.add(this.bar); 
        this.add(this.label);
        this.add([this.label, this.bar]);
        this.setVisible(true); 
        
    }

    public setProgress(percent: number) {
        this.bar.clear();
        if (percent <= 0) {
            this.setVisible(false);
            return;
        }

        this.setVisible(true);

     
        this.bar.fillStyle(0x000000, 0.5);
        this.bar.fillRect(-this.barWidth / 2, 0, this.barWidth, this.barHeight);

        this.bar.fillStyle(0x00ff00, 1);
        this.bar.fillRect(-this.barWidth / 2, 0, this.barWidth * percent, this.barHeight);
    }
}