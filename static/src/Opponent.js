class Opponent extends Phaser.GameObjects.Container{
    constructor(scene, x, y){
        super(scene, x, y)

        // let {width, height} = scene.scale

        // this.healthUI = scene.add.image(width - 140, 21, 'ui', 'health').setScrollFactor(0, 0).setOrigin(0, 0)
        // this.healthBarUI = scene.add.image(width - 141, 20, 'ui', 'health_frame').setScrollFactor(0, 0).setOrigin(0, 0)

        this.bodyWidth = 6
        this.scaleFactor = 2
        this.scene = scene

        scene.anims.createFromAseprite('torso')
        scene.anims.createFromAseprite('legs')
        scene.anims.createFromAseprite('guns')
        scene.anims.createFromAseprite('bullets')

        this.legs = scene.add.sprite(0, 0, "legs", "0").setName('legs')
        this.torso = scene.add.sprite(0, 0, "torso", "0").setName('torso')
        this.gun = scene.add.sprite(0, 0, "guns", "9").setName('gun')

        this.add([this.legs, this.torso, this.gun])
        this.setSize(this.bodyWidth, 24)
        scene.physics.world.enable(this)
      
       
        scene.physics.add.collider(this, scene.ground)
        scene.add.existing(this)
    	

        this.fireGroup = scene.add.group()
        this.alienGroup = scene.add.group()
        this.laserGroup = scene.add.group()
        this.rifleGroup = scene.add.group()

        scene.physics.add.collider(this.laserGroup, scene.ground, (bullet) => {
            bullet.play({key: 'bullet_hit_laser', frameRate: 30})
            bullet.body.setVelocity(0, 0)
            bullet.on('animationcomplete', () => bullet.destroy())
        })

        scene.physics.add.collider(this.rifleGroup, scene.ground, (bullet) => {
            bullet.play({key: 'bullet_hit_rifle', frameRate: 30})
            bullet.body.setVelocity(0, 0)
            bullet.on('animationcomplete', () => bullet.destroy())
        })

        scene.physics.add.collider(this.alienGroup, scene.ground, (bullet) => {
            bullet.play({key: 'bullet_hit_alien', frameRate: 35})
            bullet.body.setVelocity(0, 0)
            bullet.on('animationcomplete', () => bullet.destroy())
        })

        scene.physics.add.collider(this.fireGroup, scene.ground, (bullet) => {
            if(bullet.body.onFloor()){
                bullet.setRotation(Math.PI / 2)
                bullet.scaleX = Math.abs(bullet.scaleX)
            } else if(bullet.body.onCeiling()){
                bullet.body.allowGravity = false
                bullet.setRotation(-Math.PI / 2)
                bullet.scaleX = Math.abs(bullet.scaleX)
            } 
            
            bullet.play({key: 'bullet_hit_fire', frameRate: 24, repeat: 0}, true)
            bullet.body.setVelocity(0, 0)
            bullet.on('animationcomplete', () => bullet.destroy())
        })


        scene.physics.add.collider(this.fireGroup, scene.players, (bullet, player) => {
            player.hit()
            bullet.destroy()
        })

        scene.physics.add.collider(this.alienGroup, scene.players, (bullet, player) => {
            player.hit()
            bullet.destroy()
        })

        scene.physics.add.collider(this.laserGroup, scene.players, (bullet, player) => {
            player.hit()
            bullet.destroy()
        })

        scene.physics.add.collider(this.rifleGroup, scene.players, (bullet, player) => {
            player.hit()
            bullet.destroy()
        })



        this.setData('startQueue', [])
        this.setData('health', 100)
        this.setData('flip', false)
        this.setData('kills', 0)
        this.setData('ghost', false)
        this.setEquip('fire')
        this.gun.setData("isFiring", false)

        this.setScale(this.scaleFactor, this.scaleFactor)
       
    }

    setEquip(equip){
        this.setData('equip', equip)
        switch (equip) {
            case "fire":
                this.removeAll()
                this.gun.setData('isAutomatic', false)
                this.gun.setData('frameRate', 15)
                this.gun.setData({'tipX': 0.86, 'tipY': 0.4})
                this.gun.setOrigin(0.48, 0.43)
                this.gun.setData({'upperBound': 1.1, 'lowerBound': -1.1})
                this.add([this.legs, this.torso, this.gun])
                break;
            case "alien":
                this.removeAll()
                this.gun.setData('isAutomatic', true)
                this.gun.setData('frameRate', 13)
                this.gun.setData({'tipX': 0.86, 'tipY': 0.57})
                this.gun.setOrigin(0.64, 0.63)
                this.gun.setData({'upperBound': 0.75, 'lowerBound': -0.75})
                this.add([this.legs, this.gun, this.torso])
                break;
            case "laser":
                this.removeAll()
                this.gun.setData('isAutomatic', true)
                this.gun.setData('frameRate', 10)
                this.gun.setData({'tipX': 0.92, 'tipY': 0.5})
                this.gun.setOrigin(0.5, 0.57)
                this.add([this.legs, this.torso, this.gun])
                this.gun.setData({'upperBound': 0.3, 'lowerBound': -0.3})
                break;
            case "rifle":
                this.removeAll()
                this.gun.setData('isAutomatic', false)
                this.gun.setData('frameRate', 13)
                this.gun.setData({'tipX': 0.9, 'tipY': 0.5})
                this.gun.setOrigin(0.5, 0.5)
                this.add([this.legs, this.torso, this.gun])
                this.gun.setData({'upperBound': 0, 'lowerBound': 0})
                break;
        
            default:
                break;
        }

        this.gun.setPosition(this.gun.displayWidth * (this.gun.originX - 0.5), this.gun.displayHeight * (this.gun.originY - 0.5))

        let distanceX = (this.gun.getData('tipX') - this.gun.originX) * this.gun.displayWidth 
        let distanceY = (this.gun.getData('tipY') - this.gun.originY) * this.gun.displayHeight

        this.gun.setData("tipDistance", Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) * this.scaleFactor) 
        this.gun.setData('isFiring', false)


      
    }

    // hit(type){

    //     switch (type){
    //         case 'fire':
    //             this.data.values.health  -= 10
    //         break;
    //         case 'alien':
    //             this.data.values.health  -= 20
    //         break;
    //         case 'laser':
    //             this.data.values.health  -= 20
    //         break;
    //         case 'rifle':
    //             this.data.values.health  -= 60
    //         break;

    //         default:
    //         break;
    //     }

    //     this.healthUI.scaleX = this.getData('health') / 100

    // }

    hit(){
        this.scene.tweens.addCounter({
            onStart: () => {this.getByName('torso').setTint(0xFB8A6F)
                            this.getByName('gun').setTint(0xFB8A6F)},
            duration: 70,
            onComplete: () => {this.getByName('torso').clearTint()
                                this.getByName('gun').clearTint()}
            
        })
    }

    ghost() {
        const parts = []
        parts[0] = this.getByName("torso")
        parts[1] = this.getByName("legs")
        parts[2] = this.getByName("gun")
        this.scene.tweens.add({
            targets: parts,
            alpha: 0.2,
            duration: 300,
            yoyo: true,
            onStart: () => {
                this.setData('ghost', true)
            },
            onStop: () => {
                this.setData('ghost', false)
            },
            repeat: 7,
        })

    }

    drawHealthBar() {
    }


    shoot(){
        
        let offSetX = (Math.cos(this.gun.rotation ) * this.gun.getData('tipDistance') + this.gun.x ) * this.scaleX / this.scaleFactor
        let offSetY = Math.sin(this.gun.rotation ) * this.gun.getData("tipDistance") + this.gun.y
    
        let bullet = this.scene.physics.add.sprite(this.x + offSetX , this.y + offSetY, 'bullets')
        bullet.body.setMass(0)
        
        let componentX = Math.cos(this.gun.rotation) * this.scaleX / this.scaleFactor
        let componentY = Math.sin(this.gun.rotation)
        let speed;

        switch (this.getData('equip')) {
            case 'fire':
                speed  = 300
                bullet.setSize(4, 4)
                this.scaleX < 0 ? bullet.body.offset.x += 4.5 : bullet.body.offset.x += 0.5   
                bullet.body.offset.y -= 0.5
                bullet.setScale(1.75 * this.scaleX / this.scaleFactor, 1.75)
                bullet.setVelocity(speed * componentX , speed * componentY)
                // this.body.setVelocity(-speed * componentX, -speed * componentY)
                bullet.play('bullet_idle_fire')
                bullet.body.allowGravity = true
                this.fireGroup.add(bullet)
                break;
            case 'alien':
                speed  = 400
                bullet.setSize(5, 1)

                if(this.scaleX < 0){
                    bullet.body.offset.x += 8
                    bullet.body.offset.y += 2 
                } else{
                    bullet.body.offset.x += 2
                    bullet.body.offset.y += 2 
                }
            
                bullet.setVelocity(speed * componentX, speed * componentY)
                bullet.setScale(1.75 * this.scaleX / this.scaleFactor, 1.75)
                bullet.setRotation(this.gun.rotation * this.scaleX / this.scaleFactor)
                bullet.play('bullet_idle_alien')
                bullet.body.allowGravity = false

                this.alienGroup.add(bullet)
                break;
            case 'laser':
                speed  = 400
                bullet.setSize(7, 7)
                bullet.setVelocity(speed * componentX, speed * componentY)
                bullet.setScale(0.9 * this.scaleX / this.scaleFactor, 0.9)
                bullet.setRotation(this.gun.rotation * this.scaleX / this.scaleFactor)
                this.scaleX < 0 ? bullet.body.offset.x += 10 : bullet.body.offset.x += 3                
                bullet.play('bullet_idle_laser')
                bullet.body.allowGravity = false
                this.laserGroup.add(bullet) 
                break;
            case 'rifle':
                speed  = 400
                bullet.setSize(2, 1)
                this.scaleX < 0 ? bullet.body.offset.x += 1.5 : bullet.body.offset.x -= 1
                bullet.body.offset.y += 0.5 
                bullet.setScale(1.75 * this.scaleX / this.scaleFactor, 1.75)
                bullet.setVelocity(speed * componentX, speed * componentY)
                bullet.setRotation(this.gun.rotation)
                bullet.play('bullet_idle_rifle')
                bullet.body.allowGravity = false

                this.rifleGroup.add(bullet)
                break;
            default:
                break;
        }
         
    }

    setFlip(flip){
        
        if(flip){
            this.setScale(-this.scaleFactor, this.scaleFactor)
            this.body.setOffset(this.bodyWidth, 0)
            this.setData('flip', true)

        } else if(!flip){
            this.setScale(this.scaleFactor, this.scaleFactor)
            this.body.setOffset(0, 0)
            this.setData('flip', false)
        }
    }

    play(config, ignoreIfPlaying=false){    
        let keySplit = config.key.split("_")
        switch (keySplit[0]){
            case "legs":
                this.legs.play(config, ignoreIfPlaying)
                break
            case "gun":
                config.frameRate = this.gun.getData("frameRate")
                config.key = config.key + "_" + this.getData('equip')
                this.gun.play(config, ignoreIfPlaying)
    
                config.key = "torso_" + keySplit[1] + "_" + this.getData('equip')
                this.torso.play(config, ignoreIfPlaying)
                    
                if(keySplit[1] === 'fire'){
                    this.gun.setData("isFiring", true)
                }
                break
            case "torso": 
                config.key = config.key + "_" + this.getData('equip')
                this.torso.play(config, ignoreIfPlaying)
                break
            
            default:
                break
        }  
        config.key = keySplit[0] + "_" + keySplit[1]
    }

    

}

