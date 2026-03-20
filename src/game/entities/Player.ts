import {Scene} from 'phaser';
import { ProgressBar } from './ProgressBar';

interface MovementKeys{
    left:Phaser.Input.Keyboard.Key,
    right:Phaser.Input.Keyboard.Key,
    up:Phaser.Input.Keyboard.Key,
    down:Phaser.Input.Keyboard.Key,
    space:Phaser.Input.Keyboard.Key
}

export class Player extends Phaser.GameObjects.Container{
    public speed:number = 160;
    public playerSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    public cursors:MovementKeys;
    private lastDirection: "right" | "left" | "up" | "down" = "down";
    private pBar:ProgressBar;
    constructor(scene:Scene,x :number, y:number){
        super(scene, x,y);
        

        this.playerSprite = this.scene.physics.add.sprite(100, 100, 'player_idle_down');
        this.playerSprite.setCollideWorldBounds(true);
        if (this.scene.input.keyboard)
            this.cursors = this.scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                space: Phaser.Input.Keyboard.KeyCodes.SPACE
            }) as MovementKeys;

        this.playerSprite.setScale(3)
        this.playerSprite.setDepth(10)
        this.pBar = new ProgressBar(scene,96,48);
        this.add([this.playerSprite, this.pBar]);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.playerSprite.width, this.playerSprite.height);
        body.setCollideWorldBounds(true);
        
    }

    public updatePlantingStatus(current: number, max: number) {
        const percent = Phaser.Math.Clamp(current / max, 0, 1);
        this.pBar.setProgress(percent);
    }  

    update(time:number, delta:number): void {
        this.handleMovement(time, delta);
        
    }
    handleMovement(time:number, delta:number){
    const speed = 160;
    const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);
    if (this.cursors.left.isDown) {
        body.setVelocityX(-speed);
    
        this.lastDirection = 'left'
    } else if (this.cursors.right.isDown) {
        body.setVelocityX(speed);
  
        this.lastDirection = 'right'
    }


    if (this.cursors.up.isDown) {
        body.setVelocityY(-speed);

        this.lastDirection = 'up'
    } else if (this.cursors.down.isDown) {
        body.setVelocityY(speed);
       
        this.lastDirection = 'down'
    }



    if (body.velocity.x !== 0 || body.velocity.y !== 0) {
        this.playerSprite.anims.play(`walk-${this.lastDirection}`, true);
    } else {
        this.playerSprite.anims.play(`idle-${this.lastDirection}`, true);
    }

    body.velocity.normalize().scale(speed);
    }
}