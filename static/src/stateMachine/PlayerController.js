
class PlayerController{
    constructor(player, cursors, scene){
        this.stateMachine = new StateMachine('PlayerController', this)
        this.scene = scene
        this.player  = player
        this.cursors = cursors
        this.lastFire = 0

        let {width, height} = scene.scale

        this.pointer = {
            x: width,
            y: height / 2
        }


        scene.input.on('pointermove', (pointer) => {
			this.pointer.x = pointer.x
			this.pointer.y = pointer.y
		})


        let gun = player.getByName('gun')

		scene.input.on('pointerdown', (pointer) => {        
            if(scene.time.now - this.lastFire >=  gun.getData('fireWait') && player.bullets[player.getData('equip')].in > 0){
                this.player.play({key: "gun_fire", repeat: -1}, true)
                this.lastFire = scene.time.now
            }
   
		})


       

       gun.on('animationrepeat', () => {
        if(gun.getData("isFiring")){
                if(gun.getData("isAutomatic") && !scene.input.activePointer.primaryDown){
                    this.player.play({key: "gun_idle", repeat: -1}, true)
                    gun.setData("isFiring", false)
            
                } else if(!gun.getData('isAutomatic')){
                    this.player.play({key: "gun_idle", repeat: -1}, true)
                    gun.setData("isFiring", false)
                } 
                this.player.shoot()
            }
        })

    

        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter,
            onUpdate: this.idleOnUpdate
        })

        this.stateMachine.addState('walk', {
            onEnter: this.walkOnEnter,
            onUpdate: this.walkOnUpdate
        })

        this.stateMachine.addState('jump', {
            onEnter: this.jumpOnEnter,
            onUpdate: this.jumpOnUpdate
        })

        this.stateMachine.setInitialState('idle')

    }

    update(dt){
        this.stateMachine.update(dt)

        if(this.pointer.x - (this.player.x - this.scene.cameras.main.scrollX) < 0){
            this.player.setFlip(true)
        } else {
            this.player.setFlip(false)
        }

        if(Phaser.Input.Keyboard.JustDown(this.cursors.reload)){
            this.player.reload()
        }

        if(Phaser.Input.Keyboard.JustDown(this.cursors.one)){
            this.player.setEquip('fire')
            this.player.play({key: "gun_idle", repeat: -1})
        } else if(Phaser.Input.Keyboard.JustDown(this.cursors.two)){
            this.player.setEquip('alien')
            this.player.play({key: "gun_idle", repeat: -1})
        } else if(Phaser.Input.Keyboard.JustDown(this.cursors.three)){
            this.player.setEquip('laser')
            this.player.play({key: "gun_idle", repeat: -1})
        } else if(Phaser.Input.Keyboard.JustDown(this.cursors.four)){
            this.player.setEquip('rifle')
            this.player.play({key: "gun_idle", repeat: -1})
        }

    
        let gunOffsetX = (this.player.getByName('gun').originX - 0.5) * this.player.getByName('gun').displayWidth
        let gunOffsetY = (this.player.getByName('gun').originY - 0.5)* this.player.getByName('gun').displayHeight

        let deltaX = Math.abs((this.pointer.x - gunOffsetX - (this.player.x - this.scene.cameras.main.scrollX)))
        let deltaY = ((this.player.y - this.scene.cameras.main.scrollY) + gunOffsetY - this.pointer.y)

        let rotation = Math.atan(deltaY / deltaX)

        let gun = this.player.getByName('gun')

        if(rotation >= gun.getData('upperBound')){
            rotation = gun.getData('upperBound')
        } else if (rotation <= gun.getData('lowerBound')){
            rotation = gun.getData('lowerBound')
        }

      
        gun.setRotation(-rotation)
        
        
        

    }

    idleOnEnter(){
        this.player.play({key: 'legs_idle', repeat: -1})
        
    }

    idleOnUpdate(){

        let spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)

        if(this.cursors.left.isDown){
            this.stateMachine.setState('walk')
        } else if(this.cursors.right.isDown){
            this.stateMachine.setState('walk')
        } else if(spaceJustPressed){
            this.stateMachine.setState('jump')
        }
        if(this.player.body.onFloor()){
            this.player.body.setVelocityX(0)
        }


    }

    walkOnEnter(){
        this.player.play({key: 'legs_walk', repeat: -1})

    }

    walkOnUpdate(){
        let spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)
        var speed = 100
        if(this.cursors.left.isDown){
            this.player.body.setVelocityX(-speed)
        } else if(this.cursors.right.isDown){
            this.player.body.setVelocityX(speed) 
        } else { 
            this.stateMachine.setState('idle')
        }
        
        if(spaceJustPressed){
            this.stateMachine.setState('jump')
        }
    }

    jumpOnEnter(){
        this.player.body.setVelocityY(-250)
        this.player.play({key: 'legs_jump', repeat: 0})
        this.stateMachine.states.jump.numJumps = 1
    }

    jumpOnUpdate(){
        var speed = 100
        let spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)
        if(this.cursors.left.isDown){
          
            this.player.body.setVelocityX(-speed)
        } else if(this.cursors.right.isDown){
        
            this.player.body.setVelocityX(speed) 
        } 

        if(this.stateMachine.states.jump.numJumps < 2 && spaceJustPressed){
            this.player.body.setVelocityY(-250)
            this.player.play({key: 'legs_jump', repeat: 0})
            this.stateMachine.states.jump.numJumps += 1
        }

        if(this.player.body.onFloor()){
            this.player.body.setVelocityX(0)
            this.stateMachine.setState('idle')
        }

    }
   




}