import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

interface MovementKeys{
    left:Phaser.Input.Keyboard.Key,
    right:Phaser.Input.Keyboard.Key,
    up:Phaser.Input.Keyboard.Key,
    down:Phaser.Input.Keyboard.Key,
    space:Phaser.Input.Keyboard.Key
}

class PlantSpot{
    plant:string|null = null
    x:number;
    y:number;
    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    }
}

class Plant extends Phaser.GameObjects.Sprite{

    grow(){}
}

class Beetroot extends Phaser.GameObjects.Sprite{

    growthStages:number = 5
    currentGrowthStage:number = 0
    timer :number = 3000
    constructor(scene:Scene,  texture:string ='beetroot', x:number = 0, y:number = 0){
        super(scene,x,y,texture)
        scene.add.existing(this)
        this.setScale(5)
    }

    grow(){
        if (this.currentGrowthStage < this.growthStages){
            this.currentGrowthStage +=1
        }
        else{
            
        }
        this.setFrame(this.currentGrowthStage)

    }

    update(delta:number): void {
        if (this.timer > 0){
            this.timer -= delta
            console.log(this.timer)
            return
        }
        else{
            this.grow()
            this.timer = 3000
        }
    }
}

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors:MovementKeys;
    currentZone: Phaser.GameObjects.Zone | null = null;
    lastDirection: "right" | "left" | "up" | "down" = "down";

    zoneToPlantSpot = new Map<string,PlantSpot>()
    plants:Phaser.GameObjects.Sprite[] = []
    constructor ()
    {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;

        const directions = ["down", "up", "left", "right"]
        for (const d of directions) {
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

        this.player = this.physics.add.sprite(100, 100, 'player_idle_down');
        this.player.setScale(2); // Match your map scale
        this.player.setCollideWorldBounds(true);


        //this.physics.add.collider(this.player, map);





        const map = this.make.tilemap({ key: 'map' })
        const obj_tileset = map.addTilesetImage('objects_demo', 'objects_demo')
        const terrain_tileset = map.addTilesetImage('terrain', 'terrain_demo')

        if (obj_tileset && terrain_tileset) {
            [map.createLayer('base', terrain_tileset, 0, 0),
            map.createLayer('fence', obj_tileset, 0, 0),
            map.createLayer('grass', terrain_tileset, 0, 0),
            map.createLayer('crops', terrain_tileset, 0, 0),
            map.createLayer('paths', terrain_tileset, 0, 0)].forEach(l => l?.setScale(5))
        }
        else {
            console.log("Error loading tilesets.")
        }

        const plantLayer = map.getObjectLayer('plant_locations')
        const cropPositions:PlantSpot[] = []
        if (plantLayer) {

            plantLayer.objects.forEach((obj,i) => {
                // Tiled coordinates are based on the original map size.
                // If you scaled your layers by 5, you must scale these coordinates too!
                const x = (obj.x ?? 0) * 5;
                const y = (obj.y ?? 0) * 5;
                cropPositions.push(new PlantSpot(x,y))
            });
        }

        const maintenanceLayer = map.getObjectLayer('crops_maintance');
        const interactionZones = this.physics.add.staticGroup();

        if (maintenanceLayer) {
            maintenanceLayer.objects.forEach((obj,i) => {
                // Apply your scale (5x) to the coordinates and dimensions
                const x = (obj.x ?? 0) * 5;
                const y = (obj.y ?? 0) * 5;
                const width = (obj.width ?? 0) * 5;
                const height = (obj.height ?? 0) * 5;

                // Create an invisible Zone. 
                // Note: Tiled Rectangles use Top-Left origin (0,0)
                const zone = this.add.zone(x, y, width, height);
                zone.setName(obj.name)
                interactionZones.add(zone);
                // Add physics to the zone
                this.physics.add.existing(zone, true); // 'true' makes it a static body
                this.zoneToPlantSpot.set(zone.name, cropPositions[i]);
                
            });
        }

         // Update the overlap to track the zone
        this.physics.add.overlap(this.player, interactionZones, (p, zone) => {
            this.currentZone = zone as Phaser.GameObjects.Zone;
        });



       



        if (this.input.keyboard)
            this.cursors = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                space: Phaser.Input.Keyboard.KeyCodes.SPACE
            }) as MovementKeys;

        this.player.setScale(3)
        this.player.setDepth(10)

        
    }
    
    update(time:number, delta:number) {
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


    if (this.cursors.space.isDown && this.currentZone){
        const spot = this.zoneToPlantSpot.get(this.currentZone.name);
        if(!spot || spot.plant){return}
        const plant = new Beetroot(this);
        plant.setOrigin(0,0)
        plant.x = spot?.x
        plant.y = spot?.y
        spot.plant = "betroot"
        this.plants.push(plant)
    }

    for(const p of this.plants){
        p.update(delta)
    }
}

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
