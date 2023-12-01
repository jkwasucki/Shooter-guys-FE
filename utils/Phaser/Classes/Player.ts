import { Socket, io } from "socket.io-client";
import Main from "../Scenes/Main";
import Weapon from "./Weapon";

export default class Player extends Phaser.GameObjects.Sprite {
    weapon
    shadow
    scene:Main
    playerId
    socket
    facing
    cursors
    cursorsState
    firelock
    alive
    respawnText:Phaser.GameObjects.Text | undefined
    deathText:Phaser.GameObjects.Text | undefined
    dieInitiated:boolean
    constructor(scene:Main,x:number,y:number,playerId:string,socket:Socket | undefined) {
        super(scene, x, y, 'hero_idle_right');
        this.socket = socket
        this.scene = scene
        this.playerId = playerId

        this.alive = true
        this.dieInitiated = false
        
        this.respawnText = undefined
        this.deathText = undefined

        this.firelock = false
        this.facing = ''
        this.cursorsState = {
            up:false,
            down:false,
            left:false,
            right:false,
            space:false
        }
       
        this.cursors = scene.input.keyboard!.createCursorKeys();

        this.shadow = scene.physics.add.sprite(0,0,'shadow')

        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.add.existing(this.shadow);

        this.shadow.setScale(0.150)
        
        if(scene.socket!.id === this.playerId){
            this.scene.cameras.main.startFollow(this);
        }

    
        this.setScale(.150)
        this.setOrigin(0.5,0.5)
        this.setDepth(1)

        this.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('hero_idle_right', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk',
            frames: scene.anims.generateFrameNumbers('hero_walk_right', { start: 0, end: 7 }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'death',
            frames: scene.anims.generateFrameNumbers('hero_death', { start: 0, end: 3 }),
            frameRate: 60,
            repeat: 1
        });

         //Sync shadow,depth and weapon movement with player
         this.socket!.on('playerMoved',(movingPlayer)=>{
    
            if(movingPlayer.playerId === this.playerId){
                this.alive = movingPlayer.alive
                this.setPosition(movingPlayer.x,movingPlayer.y)
                this.weapon.move(scene,movingPlayer.x,movingPlayer.y + 15)
                this.weapon.updateDepth(this)
                this.shadow.setPosition(movingPlayer.x,movingPlayer.y)
                

                if(!this.alive){
                    this.die()
                }
            }  
        })

        this.socket!.on('weaponRotated',(player)=>{
            if(player.playerId === this.playerId){
                this.weapon.angle = player.weapon.angle
                
            }
        })

        this.socket!.on('updatedCursors',(cursors)=>{
            if(cursors.playerId === this.playerId){
                
                if(!this.alive && cursors.cursors.space){
                    this.respawn()
                }

                if(this.alive){
                    this.facing = cursors.facing

                    if(
                        !cursors.cursors.down
                        && !cursors.cursors.up
                        && !cursors.cursors.left
                        && !cursors.cursors.right
                    ) {
                        this.play('idle',true)
                    }
        
                    if(this.weapon.facing === 'left'){
                        this.setFlipX(true)
                        this.facing = 'left'
                    }else{
                        this.setFlipX(false)
                        this.facing = 'right'
                    }
                    
                    if(cursors.cursors.left) {
                        this.setFlipX(true);
                        this.play('walk', true);
                    }else if (cursors.cursors.right) {
                        this.setFlipX(false);
                        this.play('walk', true);
                    }
                    if(cursors.cursors.up || cursors.cursors.down){
                        this.play('walk', true);
                    }
                    if(cursors.cursors.space){
                        if(!this.firelock){
                            this.firelock = true
                            this.weapon.muzzle.setAlpha(1,1,1,1)
                            
                            scene.cameras.main.shake(200, 0.003);
                            
                            this.weapon.fire(scene)
                            setTimeout(()=>{
                                this.weapon.muzzle.setAlpha(0,0,0,0)
                            },50)
                        
                            setTimeout(()=>{
                            this.firelock = false  
                            
                            },this.weapon.fireSpeed)
                        }
                    }
                }
               
                
            }
        })

        //Initialize starting weapon 
        this.weapon = new Weapon(scene,"weapon_pistol",this.x,this.y,playerId,socket!,undefined,this)
    }

    move(scene:Phaser.Scene,weapons:Phaser.Physics.Arcade.Group){
          // FOR SOCKET
          this.cursorsState.up = this.cursors.up.isDown ? true : false
          this.cursorsState.down = this.cursors.down.isDown ? true : false
          this.cursorsState.left = this.cursors.left.isDown ? true : false
          this.cursorsState.right = this.cursors.right.isDown ? true : false
          this.cursorsState.space = this.cursors.space.isDown ? true : false

        if(this.alive){
          

            //Track collision between player and weapon laying on the ground
            scene.physics.world.overlap(this, weapons, this.pickupGun, undefined, this);

            if(
                !this.cursorsState.down
                && !this.cursorsState.up
                && !this.cursorsState.left
                && !this.cursorsState.right
            ) {
                this.play('idle',true)
            }

            if(this.weapon.facing === 'left'){
                this.setFlipX(true)
                this.facing = 'left'
            }else{
                this.setFlipX(false)
                this.facing = 'right'
            }
            
            if(this.cursorsState.left) {
                this.x -= 3
            
                this.setFlipX(true);
                this.play('walk', true);
            }else if (this.cursorsState.right) {
                this.x += 3
                
                this.setFlipX(false);
                this.play('walk', true);
            }
            if(this.cursorsState.up || this.cursorsState.down){
                this.play('walk', true);
                if(this.cursors.up.isDown){
                    this.y = this.y -= 3
                }else this.y = this.y += 3
            }
            if(this.cursorsState.space){
                if(!this.firelock){
                    this.firelock = true
                    this.weapon.muzzle.setAlpha(1,1,1,1)
                    
                    scene.cameras.main.shake(200, 0.003);
                    
                    this.weapon.fire(scene)
                    setTimeout(()=>{
                        this.weapon.muzzle.setAlpha(0,0,0,0)
                    },50)
                
                    setTimeout(()=>{
                    this.firelock = false  
                    
                    },this.weapon.fireSpeed)
                }
            }
        
            this.weapon.move(scene,this.x,this.y + 15)
            this.weapon.updateDepth(this)
            this.shadow.setPosition(this.x,this.y)
            
            if(this.weapon.angle){
                this.socket?.emit('weaponRotation',this.weapon.angle)
            }
        }else{
            this.die()
            if(this.cursors.space.isDown){
                this.respawn()
            }
        }

        //Weapon angle and movement
        this.socket?.emit('updateCursors',this.cursorsState,this.facing)

            
        this.socket!.emit('playerMovement',{
            x:this.x,
            y:this.y,
            cursors:this.cursorsState,
            alive:this.alive
        })

    }
    die(){
        if(!this.dieInitiated){           
            this.dieInitiated = true
          
            this.play('death')
            if(this.socket!.id === this.playerId){
                this.deathText = this.scene.add.text(
                    window.innerWidth / 2,
                    50, 
                    'YOU ARE DEAD',
                    {
                    fontSize: 32,
                    color: '#FF0000',
                }
                ).setOrigin(0.5, 0.5);
                this.deathText.setScrollFactor(0)
                

                this.respawnText = this.scene.add.text(
                    window.innerWidth / 2,
                    100, 
                    'Press SPACE to respawn ',
                    {
                    fontSize: 32, 
                    color: '#ffffff',
                }
                ).setOrigin(0.5, 0.5);
                this.respawnText.setDepth(100000)
                this.respawnText.setScrollFactor(0)
               
            }
        }
        
    }
    respawn(){
      
        this.dieInitiated = false
                
        this.alive = true

        if (this.respawnText) {
            this.respawnText.destroy();
        }
        if (this.deathText) {
            this.deathText.destroy();
        }
        let closeToSpawn = Phaser.Math.Distance.Between(
            2048, 2048, 2500, 2500
        );

        if(closeToSpawn){
            this.x = this.x + 1000
            this.y = this.y + 1000
            this.shadow.x = this.x + 1000
            this.shadow.y = this.y + 1000
        }else{
            this.x = 2048
            this.y = 2048
            this.shadow.x = 2048
            this.shadow.y = 2048
        }       
    }

    pickupGun(player: any, weapon: any) {
        if (weapon instanceof Weapon) {
            this.weapon.destroy();
            this.weapon = new Weapon(this.scene,weapon.weapon.texture.key,this.x,this.y,this.playerId,this.socket!,weapon.id)
            //Transmit new weapon texture
            this.socket?.emit('newWeapon',weapon.weapon.texture.key,weapon.id)
            this.socket?.emit('weaponPicked',weapon.id)
            weapon.destroy()
        }
    }
}