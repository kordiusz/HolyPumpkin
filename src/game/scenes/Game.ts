import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

interface MovementKeys{
    left:Phaser.Input.Keyboard.Key,
    right:Phaser.Input.Keyboard.Key,
    up:Phaser.Input.Keyboard.Key,
    down:Phaser.Input.Keyboard.Key
}

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors:MovementKeys
    lastDirection: "right" | "left" | "up" | "down" = "down"
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;

        const map = this.make.tilemap({key:'map'})
        const obj_tileset = map.addTilesetImage('objects_demo', 'objects_demo')
        const terrain_tileset = map.addTilesetImage('terrain', 'terrain_demo')

        if (obj_tileset && terrain_tileset){
            [map.createLayer('base', terrain_tileset, 0,0),
            map.createLayer('fence', obj_tileset, 0,0),
            map.createLayer('grass', terrain_tileset,0,0),
            map.createLayer('crops', terrain_tileset,0,0),
            map.createLayer('paths', terrain_tileset, 0,0)].forEach(l=> l?.setScale(5))
        }
        else{
            console.log("Error loading tilesets.")
        }


        this.player = this.physics.add.sprite(100, 100, 'player_idle_down');
        this.player.setScale(2); // Match your map scale
        this.player.setCollideWorldBounds(true);

   
        //this.physics.add.collider(this.player, map);



         const directions = ["down", "up", "left", "right"]
        for (const d of directions){
            this.anims.create({
                key: `walk-${d}`,
                frames: this.anims.generateFrameNumbers(`player_walk_${d}`, { start: 0, end: 11 }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: `idle-${d}`,
                frames: this.anims.generateFrameNumbers(`player_idle_${d}`, { start: 0, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
    }


        if (this.input.keyboard)
            this.cursors = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }) as MovementKeys;

        this.player.setScale(3)
    }
    
    update() {
    const speed = 160;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) {
        this.player.body.setVelocityX(-speed);
        this.lastDirection = 'left'
    } else if (this.cursors.right.isDown) {
        this.player.body.setVelocityX(speed);
  
        this.lastDirection = 'right'
    }


    if (this.cursors.up.isDown) {
        this.player.body.setVelocityY(-speed);

        this.lastDirection = 'up'
    } else if (this.cursors.down.isDown) {
        this.player.body.setVelocityY(speed);
       
        this.lastDirection = 'down'
    }



    if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
        this.player.anims.play(`walk-${this.lastDirection}`, true);
    } else {
        this.player.anims.play(`idle-${this.lastDirection}`, true);
    }

    this.player.body.velocity.normalize().scale(speed);
}

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
