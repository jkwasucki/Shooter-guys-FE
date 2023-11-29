import { Socket } from "socket.io-client";
import Player from "./Player";
import Phaser from "phaser";

export default class Weapon extends Phaser.Physics.Arcade.Sprite{
    container: Phaser.GameObjects.Container;
    weapon: Phaser.GameObjects.Image;
    muzzle: Phaser.GameObjects.Image;
    bullet: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
    bullets: Phaser.GameObjects.Group;
    fireSpeed: number;
    angle: number;
    facing: string;
    socket
    playerId
    id
    shadow
    player?
    constructor(scene: Phaser.Scene,name: string, x: number, y: number,playerId?:string,socket?:Socket,id?:string,player?:Player ) {
        super(scene,x,y,"shotgun_weapon")
        this.playerId = playerId
        this.player = player
        this.id = ''
        this.socket = socket
        this.container = scene.add.container(x, y);
        this.weapon = scene.physics.add.image(0, 0, name);
        this.weapon.setScale(0.06);
        this.weapon.setOrigin(0.5, 0.5);

        this.shadow;
       

        this.muzzle = scene.add.image(this.weapon.x + this.weapon.displayWidth /2 + 10, 0, 'muzzle');
        this.muzzle.setScale(0.02)
        this.muzzle.setAlpha(0,0,0,0)
        this.container.add([this.weapon, this.muzzle]);
    
        if(playerId === undefined){
            this.shadow = scene.physics.add.image(this.container.x, this.container.y - 5, 'shadow');
            this.shadow.setScale(0.150)
        }
       
        this.bullets = scene.physics.add.group();

        this.angle = 0;
        this.facing = '';
        this.fireSpeed = 0

        if (name === 'weapon_shotgun') {
            this.fireSpeed = 1000;
        } else if (name === 'weapon_rifle') {
            this.fireSpeed = 300;
        } else if (name === 'weapon_pistol') {
            this.fireSpeed = 800;
        }

        if(this.bullet){
            scene.physics.world.enable(this.bullet);
        }
       
    }

    move(scene: Phaser.Scene, x: number, y: number) {

        //Prevents the client to rotate others guns
        if(this.socket!.id === this.playerId){
            this.angle = Phaser.Math.Angle.Between(window.innerWidth / 2, window.innerHeight / 2, scene.input.x, scene.input.y);
        }
        this.container.setRotation(this.angle);
        this.container.setPosition(x, y);

        
        if (this.angle < 1.69 && this.angle > -1.59) {
            this.facing = 'right';
            this.weapon.setFlipY(false);
        } else {
            this.facing = 'left';
            this.weapon.setFlipY(true);
        }
       
    }
    updateDepth(player:Player){
        if (this.angle < -0.36 && this.angle > -2.69) {
           
          
            this.container.setDepth(player.depth - 1);
        
    } else {
      
            this.container.setDepth(player!.depth + 1);
      
    }
    }
    fire(scene: Phaser.Scene) {
         const bullet = this.bullets.create(this.container.x, this.container.y, 'bullet');
         bullet.setScale(0.01);
 
         const speed = 1000;
         const velocityX = Math.cos(this.angle) * speed;
         const velocityY = Math.sin(this.angle) * speed;
 
         bullet.setVelocity(velocityX, velocityY);
    }
    destroy() {
        // Destroy associated game objects
        this.container.destroy();
        this.shadow?.destroy()
        this.bullets.destroy();
        this.muzzle.destroy()
        // Call the superclass destroy method
        super.destroy();
    }
}
