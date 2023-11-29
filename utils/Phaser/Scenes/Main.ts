'use client'
import { Socket, io } from "socket.io-client";
import Enemy from "../Classes/Enemy";
import Player from "../Classes/Player";
import Weapon from "../Classes/Weapon";
import { getSocket } from "@/lib/socket";

export default class Main extends Phaser.Scene{
    body:any
    socket:Socket
    players!:Phaser.Physics.Arcade.Group
    enemy:Enemy | undefined
    weapon:Weapon | undefined
    enemies:any
    weapons?: Phaser.Physics.Arcade.Group | undefined;
    background:Phaser.GameObjects.Image | undefined
    state:{
        players:{
            x: number,
            y: number,
            playerId: string
        },
        weapons:[],
        enemies:[]
    }
    constructor() {
        super('Main');
        this.state = {
            players:{
                x:0,
                y:0,
                playerId:''
            },
            weapons:[],
            enemies:[]
        }
        this.socket = getSocket()

    }

    preload() {
       

        this.load.on('progress',  () => {
            this.cameras.main.fadeIn(2000);
        });
                    
       
        this.load.spritesheet('hero_idle_right', 
            '/hero_idle.png',
            { frameWidth: 535, frameHeight: 709 }
        );
        this.load.spritesheet('hero_death', 
        '/player_death.png',
        { frameWidth: 785, frameHeight: 529 }
    );
        this.load.spritesheet('hero_walk_right', 
            '/hero_walk_right.png',
            { frameWidth: 535, frameHeight: 709 }
        );
        this.load.spritesheet('enemy1_walk',
            '/enemy1_walk.png',
            { frameWidth:737, frameHeight:665}
        );
        this.load.spritesheet('enemy1_idle',
            '/enemy1_idle.png',
            { frameWidth:716, frameHeight:636}
        );
        this.load.spritesheet('enemy_attack',
            '/enemy_attack.png',
            { frameWidth:973, frameHeight:655}
        );
        this.load.spritesheet('enemy1_hit',
            '/enemy1_hit.png',
            { frameWidth:901, frameHeight:745}
        );
        this.load.spritesheet('enemy1_death',
            '/enemy1_death.png',
            { frameWidth:2048, frameHeight:2048}
        );
        this.load.image('weapon_shotgun','/weapon_shotgun.png')
        this.load.image('weapon_rifle','/weapon_rifle.png')
        this.load.image('weapon_pistol','/weapon_pistol.png')
        this.load.image('background','/background.png')
        this.load.image('shadow','/shadow.png')
        this.load.image('bullet','/bullet.png')
        this.load.image('muzzle','/muzzle.png')
    }
    create() {
        
        const scene = this
        //Create background
        this.background = this.add.image(0,0,'background').setOrigin(0,0)
     
       
        //Create players group
        this.players = this.physics.add.group()
        
    
        this.socket.emit('join')
        //Request the initial game state
        this.socket.emit('getGameState')

        this.socket.on('userJoined',(joinText)=>{
            let playerJoinedText = scene.add.text(
                window.innerWidth / 2,
                50, 
                joinText
            ).setOrigin(0.5, 0.5);

            playerJoinedText.setScrollFactor(0)

            scene.time.delayedCall(2000, () => {
                playerJoinedText.destroy()
            }, [], scene);
        })

        //Get the initial game state
        this.socket.on('recieveGameState',(state) =>{
            const { players, enemies, weapons } = state
            players.forEach((player:Player)=>{
                if(player.playerId === this.socket!.id){
                    let client = new Player(
                        this, 
                        this.background!.width / 2, 
                        this.background!.height / 2,
                        player.playerId,
                        this.socket
                    );
                    this.players!.add(client);
                }else{
                    let friend = new Player(
                        this, 
                        player.x, 
                        player.y,
                        player.playerId,
                        this.socket
                    )
                    friend.weapon.destroy()
                    friend.weapon = new Weapon(this,player.weapon.texture.toString(),player.weapon.x,player.weapon.y,player.playerId,this.socket)
                   
                    this.players!.add(friend);
                }
            })
            weapons.forEach((weapon:Weapon)=>{
                const newWeapon = new Weapon(this,weapon.texture.toString(), weapon.x, weapon.y);
                newWeapon.id = weapon.id
                this.weapons!.add(newWeapon) 
                //Make weapon bounce on the ground
                this.tweens.add({
                    targets: newWeapon.container,
                    y: newWeapon.container.y - 10, 
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1, 
                    duration: 1000,
                });
            })
            enemies.forEach((enemy:Enemy)=>{
                const newEnemy = new Enemy(this,enemy.x,enemy.y,enemy.id,this.socket!);
                this.enemies.add(newEnemy)
            })
        })
       
        this.socket.on('newPlayer',(player)=>{
            let friend = new Player(
                this, 
                window.innerWidth /2, 
                window.innerHeight/2,
                player.playerId,
                this.socket // Passing the socket to the players
            );
            this.players!.add(friend);
        })
            
        //Create groups
        this.enemies = this.physics.add.group({ classType: Enemy });
        this.weapons = this.physics.add.group({ classType: Weapon , runChildUpdate: true })

        // Enable physics for enemies and bullets for players
        this.physics.world.enable(this.enemies);
        this.players.children.iterate((children:Phaser.GameObjects.GameObject)=>{
            if (children && children instanceof Player) {
                this.physics.world.enable(children.weapon.bullets);
            }
            return true
        })
       

        // Responsible for socket's dimensional movement
        this.socket.on('playerMoved',(movingPlayer)=>{
            this.players.getChildren().forEach(function(children){
                if(children instanceof Player){
                    if(movingPlayer.playerId === children.playerId){
                        children.setPosition(movingPlayer.x,movingPlayer.y)
                        children.weapon.move(scene,movingPlayer.x,movingPlayer.y + 15)
                        children.shadow.setPosition(movingPlayer.x,movingPlayer.y)
                    }
                }
                return true
            })
        })

        this.socket.on('pickupWeapon',(player)=>{
            this.players.getChildren().forEach((children) => {
                if(children instanceof Player){
                    if(player.playerId === children.playerId){
                        children.weapon.destroy()
                        children.weapon = new Weapon(scene,player.weapon.texture,player.x,player.y,children.playerId,this.socket,player.weapon.id,children)
                    }
                }
                return true
            })
            this.weapons?.getChildren().forEach((weapon)=>{
                if(weapon instanceof Weapon){
                    if(weapon.id === player.weapon.id){
                        weapon.destroy()
                    }
                }
            })
            return true
        })

        this.socket.on('weaponRotated',(player)=>{
            this.players.getChildren().forEach(function(children){
                if(children instanceof Player){
                    if(player.playerId === children.playerId){
                    
                        children.weapon.angle = player.weapon.angle
                    }
                }
                return true
            })
        })
        
        // Responsible for socket's movement animation
        this.socket.on('updatedCursors',(cursors)=>{
            this.players.getChildren().forEach(function(children){
                if(children instanceof Player){
                        if(cursors.playerId === children.playerId){
                               
                                // Firing a weapon
                                if(cursors.cursors.space){
                                    if(!children.firelock){
                                        children.firelock = true
                                        children.weapon.muzzle.setAlpha(1,1,1,1)
                                        children.weapon.fire(scene)
                                        setTimeout(()=>{
                                            children.weapon.muzzle.setAlpha(0,0,0,0)
                                        },50)
                                    
                                        setTimeout(()=>{
                                            children.firelock = false  
                                        
                                        },children.weapon.fireSpeed)
                                    }
                                    return
                                }
                            
                                if(!cursors.cursors.up && !cursors.cursors.down && !cursors.cursors.left && !cursors.cursors.right){
                                    children.play('idle',true)
                                    return
                                }else if(cursors.cursors.left) {
                                    children.setFlipX(true);
                                    children.play('walk', true);
                                    return
                                }else if (cursors.cursors.right) {
                                    children.setFlipX(false);
                                    children.play('walk', true);
                                    return
                                }else if(cursors.cursors.up || cursors.cursors.down){
                                    children.play('walk', true);
                                }
                                if(cursors.facing === 'left'){
                                    children.setFlipX(true)
                                    return
                                }
                                if(cursors.facing === 'right'){
                                    children.setFlipX(false)
                                    return
                                }
                            }
                            
                            
                    return true
                }
                
            })
        })
       
        

        this.socket.on('spawnEnemy',(enemy)=>{
            const newEnemy = new Enemy(this,enemy.x,enemy.y,enemy.id,this.socket!);
            this.enemies.add(newEnemy)
        })

        this.socket.on('spawnWeapon',(weapon)=>{
            const newWeapon = new Weapon(this,weapon.texture, weapon.x, weapon.y);
            newWeapon.id = weapon.id
            this.weapons!.add(newWeapon)  
            this.tweens.add({
                targets: newWeapon.container,
                y: newWeapon.container.y - 10, 
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1, 
                duration: 1000,
            });
        })

        this.socket.on('userLeft',(data)=>{
            this.players.getChildren().forEach(function(children){
                if(children instanceof Player){
                    if(data.userId === children.playerId){
                        children.destroy()
                        children.shadow.destroy();
                        children.weapon.destroy();
                       
                    }
                }
                return true
            })

            //Display notification to the users
            let playerLeftText = scene.add.text(
                window.innerWidth / 2,
                50, 
                data.text
            ).setOrigin(0.5, 0.5);

            playerLeftText.setScrollFactor(0); // Set scroll factor to 0 to make it fixed

            scene.time.delayedCall(2000, () => {
                playerLeftText.destroy()
            }, [], scene);
        })

       
        // this.socket.on('playerRespawned',(id)=>{
        //     this.players.getChildren().forEach(function(children){
        //         if(children instanceof Player){
        //             if(children.playerId === id){
        //                 children.respawn()
        //             }
        //         }
        //         return true
        //     })
        // })
       
    }

    update() {

        // this.players.getChildren().forEach(function(children){
        //     if(children instanceof Player){
        //         if(!children.alive){
        //             console.log("HAHAHAH")
        //             children.play('death')
        //             if(children.cursors.space.isDown){
        //                 children.respawn()
        //             }
        //         }else{
        //             return
        //         }
                   
                 
              
        //     }
        // }) 

        //Manage depth
        this.enemies.children.iterate((enemy:Enemy)=>{
            if(enemy instanceof Enemy){
                enemy.setDepth(enemy.y)
                enemy.shadow?.setDepth(enemy.y - 1)
            }
           
        })

         //Manage depth
        this.players.children.iterate((player: Phaser.GameObjects.GameObject)=>{
            if(player instanceof Player){
                player.setDepth(player.y)
                player.shadow?.setDepth(player.y - 1)
                player.weapon.container.setDepth(player.y + 1)

            }
            return true
        })

        

        // Allow players movement
        this.players?.children.iterate((player: Phaser.GameObjects.GameObject) => {
            if (player && player instanceof Player) {
                if(player.playerId === this.socket?.id){
                    player.move(this, this.weapons!)
                    this.socket.emit('playerMovement',{
                        x:player.x,
                        y:player.y,
                        cursors:player.cursorsState
                    })
                }
             
            }
            return true; // Continue iterating
        }); 
        //Move Enemies
        if (this.enemies) {
            this.enemies.children.iterate((enemy: Enemy) => {
                if (enemy && enemy instanceof Enemy && enemy.alive && !enemy.hitEnemy) {
                    let nearestPlayer: Player | null = null;
                    let minDistance = Number.MAX_SAFE_INTEGER;
        
                    this.players?.children.iterate((player: Phaser.GameObjects.GameObject) => {
                        if (player && player instanceof Player) {
                            const distance = Phaser.Math.Distance.Between(
                                enemy.x, enemy.y, player.x, player.y
                            );
        
                            if (distance < minDistance) {
                                minDistance = distance;
                                nearestPlayer = player;
                            }
                        }
        
                        return true; // Continue iterating
                    });
        
                    if (nearestPlayer) {
                        enemy.move(nearestPlayer, this);
                    }
                }
            });
        }
    }
}

