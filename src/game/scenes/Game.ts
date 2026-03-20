import { Player } from '../entities/Player';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';





class PlantSpot{
    plant:Plant|null = null
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

class Beetroot extends Plant{

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
class Garlic extends Plant{

    growthStages:number = 5
    currentGrowthStage:number = 0
    timer :number = 2500
    constructor(scene:Scene,  texture:string ='garlic', x:number = 0, y:number = 0){
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
            this.timer = 2500
        }
    }
}

interface Tool{
    
}
export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    player: Player;
    currentZone: Phaser.GameObjects.Zone | null = null;
    tools : Tool[];
    currentTool:Tool;
    currentSeed: "Garlic" | "Pumpkin" | "Corn" | "Beetroot" = "Garlic";
    zoneToPlantSpot = new Map<string,PlantSpot>()
    plants:Phaser.GameObjects.Sprite[] = []
    progressBar:Phaser.GameObjects.Graphics;
    progressText:Phaser.GameObjects.Text;
    plantingProgress:number;
    isPlanting:boolean;
    timer:number = 0;
    currentSpot:PlantSpot;
    well:Phaser.GameObjects.Sprite;
    chest:Phaser.GameObjects.Sprite;
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
        this.player = new Player(this, 50, 50);
        this.player.setDepth(100);


        this.well = this.physics.add.staticSprite( 96,320,'well').setDepth(10).setScale(2.5);
        this.chest = this.physics.add.staticSprite(32*22, 320, 'chest').setDepth(10).setScale(4);
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
        this.physics.add.overlap(this.player.playerSprite, interactionZones, (p, zone) => {
            this.currentZone = zone as Phaser.GameObjects.Zone;
        });
       




 

        
    }




update(time: number, delta: number) {
    // 1. Update player movement
    this.player.update(time, delta);

    // 2. Check channeling conditions
    // We only plant if: Space is DOWN AND we are overlapping a ZONE
    const isTryingToPlant = this.player.cursors.space.isDown && this.currentZone;

    if (isTryingToPlant) {
        const spot = this.zoneToPlantSpot.get(this.currentZone!.name);

        // Don't start planting if there's already a plant there
        if (spot && !spot.plant) {
            this.isPlanting = true;
            this.timer += delta;
            this.player.updatePlantingStatus(this.timer, 2000);

            // 3. Check if channeling is finished
            if (this.timer >= 2000) {
                this.completePlanting(spot);
                this.resetPlanting();
            }
        }
    } else {
        // 4. RESET if they let go or move away
        this.resetPlanting();
    }

    // 5. Update all growing plants
    for (const p of this.plants) {
        p.update(delta);
    }

    // CRITICAL: Reset currentZone so overlap must prove it every frame
    this.currentZone = null;
}

// Helper to keep update() clean
private completePlanting(spot: PlantSpot) {
    let plant: Plant;
    switch (this.currentSeed) {
        case 'Garlic': plant = new Garlic(this); break;
        default: plant = new Beetroot(this); break;
    }

    plant.setOrigin(0, 0);
    plant.x = spot.x;
    plant.y = spot.y;
    spot.plant = plant;
    this.plants.push(plant);
}

private resetPlanting() {
    this.isPlanting = false;
    this.timer = 0;
    this.player.updatePlantingStatus(0, 2000);
}

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
