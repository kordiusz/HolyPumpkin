import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';

function App()
{
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const changeScene = () => {

        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as MainMenu;
            
            if (scene)
            {
                scene.changeScene();
            }
        }
    }

    const moveSprite = () => {

        if(phaserRef.current)
        {

            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === 'MainMenu')
            {
                // Get the update logo position
                scene.moveLogo(({ x, y }) => {

                    setSpritePosition({ x, y });

                });
            }
        }

    }

    const addSprite = () => {

        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                // Add more stars
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);
    
                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                const star = scene.add.sprite(x, y, 'star');
    
                //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
                //  You could, of course, do this from within the Phaser Scene code, but this is just an example
                //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    return (
        <div id="app">
              <div className="container">
    <div><img src="/assets/logo-smaller.png"/></div>

    <div className="game-layout">
      
      <div className="powerup-preview-side-menu">
        <span className="title">
          Tool
        </span>
        <div>
    <img src="/icons/corn.png"/>
    <span>Tool</span>
  </div>  
        <span className="title">
          Inventory
        </span>
        
<ul>

  <li>
    <img src="/icons/corn.png"/>
    <span>Corn<span className="powerup-info">[7.5s]</span></span>
  </li>
  <li>
    <img src="/icons/garlic.png"/>
    <span>Garlic <span className="powerup-info">[10s]</span></span>
  </li>
  <li>
    <img src="/icons/pumpkin.png"/>
    <span>Pumpkin <span className="powerup-info">[max 5]</span></span>
  </li>
  <li>
    <img src="/icons/beetroot.png"/>
    <span>Beetroot <span className="powerup-info">[max 4]</span></span>
  </li>
</ul>

      </div>


      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

      <div className="controls-info">
        <span className="title">
          Controls
        </span>
        
<ul>
  <li>
    <span className="control-key">W S A D</span>
    <span>Movement</span>
  </li>
  <li>
    <span className="control-key">SPACE</span>
    <span>Action</span>
  </li>
</ul>

      </div>
    </div>

  </div>
        </div>
    )
}

export default App
