import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {


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

        EventBus.emit('current-scene-ready', this);
    }
    
    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (vueCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback)
                    {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
