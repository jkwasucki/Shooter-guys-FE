
import { Socket } from "socket.io-client";
import Player from "./Player";
export default class Enemy extends Phaser.Physics.Arcade.Sprite{
   
    shadow: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null
    prevX:number
    scene
    alive
    hitEnemy
    id
    socket
    constructor(scene:Phaser.Scene,x:number,y:number,id:string,socket:Socket){
        super(scene, x, y, 'enemy1_walk');
        this.scene = scene
        this.socket = socket

        this.shadow = scene.physics.add.sprite(this.x, this.y, 'shadow');
        
        this.alive = true;
        this.hitEnemy = false;
        this.prevX = this.x;
    
        this.id = id
      
        // Bind hit method to this context
        this.hit = this.hit.bind(this);
      
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.add.existing(this.shadow);

        
        this.shadow.setScale(0.150)
        this.setScale(.150)
        this.setOrigin(0.5,0.5)
        this.setDepth(1)

        this.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNumbers('enemy1_walk', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNumbers('enemy1_idle', { start: 0, end: 5 }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'hit',
            frames: this.scene.anims.generateFrameNumbers('enemy1_hit', { start: 0, end: 2 }), 
            frameRate: 20,
            repeat: 1
        });
        this.anims.create({
            key: 'death',
            frames: this.scene.anims.generateFrameNumbers('enemy1_death', { start: 0, end: 10 }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'attack',
            frames: this.scene.anims.generateFrameNumbers('enemy_attack', { start: 0, end: 2 }), 
            frameRate: 20,
            repeat: -1
        });
      
        this.play('idle',true)
    }

    hit(enemy:any,bullet:any) {
       
        enemy.hitEnemy = true
        enemy.play('hit', true);
        enemy.setVelocity(0,0)

        bullet.destroy();
    
        enemy.on('animationcomplete-hit', () => {
            enemy.alive = false
            enemy.destroy();
            enemy.shadow.destroy()
            //Tell the server that enemy got killed and remove from state
            this.socket.emit('enemyKilled',enemy.id)
        });
    }
    
    move(player:Player,scene:Phaser.Scene){

        //Track collision between enemy and bullet
        scene.physics.world.overlap(
            this,
            player!.weapon.bullets,
            this.hit, //Run hit when collision is detected
            undefined,
            this
        );

        // Move enemy
        if (this.alive && !this.hitEnemy) {
            const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

            if (distanceToPlayer > 50) {
                scene.physics.moveToObject(this, player, 200);
        
                if (this.x > this.prevX) {
                    this.setFlipX(false);
                    this.play('walk', true);
                } else if (this.x < this.prevX) {
                    this.setFlipX(true);
                    this.play('walk', true);
                } else {
                    this.play('walk', true);
                } 
            } else {
                // Stop the enemy if it's close to the player
                this.setVelocity(0);
                this.play('attack',true)       
                player.die()    
            }

            this.socket?.emit('enemyMoving',{x:this.x,y:this.y,id:this.id})
            this.prevX = this.x;
        }
        this.shadow!.setPosition(this.x, this.y);
    }
} 

