
class Level extends Phaser.Scene {


	constructor() {
		super("Level");

		
		this.playerController
		this.cursors
		this.player

	}

	init(data){
		this.cursors = {
			left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
			up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
			two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
			three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
			four: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
			space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
			reload: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)

		}

		this.room = data.room
		this.username = data.username

	}

	preload(){
		this.load.pack("assets-pack", "static/assets/asset-pack.json")
		
	}

	create() {
		
		for(let i = -1; i < 4; i++){
			for(let j = -1; j < 4; j++){
				const image = this.add.image(i*720, j*480, 'clouds')
				image.setOrigin(0,0)
			}
		}
		const map = this.make.tilemap({key: "pixel_map"})
		const tileset = map.addTilesetImage("lucas_tiles", "pixel_tileset")

		this.ground = map.createLayer("ground", tileset)
		this.ground.setCollisionByProperty({collides: true})

		this.leaderboard = this.add.group()
		

		var self = this
		this.socket = io()
		this.players = this.add.group()

		this.connected = false;

		this.socket.on("connect", () => {
			this.connected = true;
			this.socket.emit('connected', this.username) 
		})

		this.socket.on('currentPlayers', (players) => {
			Object.keys(players).forEach((id) => {
				if(players[id].playerID === this.socket.id){
					this.addPlayer(players[id])

				} else {
					this.addOtherPlayer(players[id])
				}

				// this.addToLeaderboard()
				this.drawLeaderboard()
			})
		})

		this.socket.on('newPlayer', (player) => {
			if(player.playerID != this.socket.id){
				this.addOtherPlayer(player)
				
				// this.addToLeaderboard()
				this.drawLeaderboard()
			}
	
		})
		
		

		this.socket.on('userDisconnected', (json) => {
			let removalPlayer = null;
			self.players.getChildren().forEach((player) => {
				if(player.getData('playerID') === json.playerID){
					removalPlayer = player 
					// player.removeAll([true, true, true])
					// player.destroy()

					// this.leaderboard = []
				}
			})
			self.players.remove(removalPlayer, true, true)
	
			this.drawLeaderboard()
			
		})

		this.socket.on('newHitData', (data) => {
			if(data.hID === this.socket.id){

				if(this.player.takeDamage(data.t)){
					this.socket.emit('iDied', data)
				}
				
			} 
		})

		this.socket.on('newKillData', (killer) => {
			this.players.getChildren().forEach((player) => {
				if(player.getData('playerID') == killer){
					player.data.values.kills += 1
					console.log(player.getData('name'))
					console.log(player.data.values.kills)
					this.drawLeaderboard()
				}
			})
		})

		this.socket.on('fillAmmo',  (data) => {
			if(this.socket.id === data.player) {
				switch(data.gun) {
					case 'fire':
						this.player.bullets.fire.in = this.player.bullets.fire.full
						this.player.bullets.fire.reserve = 4
						break;
					case 'laser':
						this.player.bullets.laser.in = this.player.bullets.laser.full
						this.player.bullets.laser.reserve = 30
						break;
					case 'alien':
						this.player.bullets.alien.in = this.player.bullets.alien.full
						this.player.bullets.alien.reserve = 20
						break;
					case 'rifle':
						this.player.bullets.rifle.in = this.player.bullets.rifle.full
						this.player.bullets.rifle.reserve = 3
						break;
					default:
						this.player.bullets.rifle.in = this.player.bullets.rifle.full
						this.player.bullets.rifle.reserve = 3
						this.player.bullets.alien.in = this.player.bullets.alien.full
						this.player.bullets.alien.reserve = 20
						this.player.bullets.laser.in = this.player.bullets.laser.full
						this.player.bullets.laser.reserve = 30
						this.player.bullets.fire.in = this.player.bullets.fire.full
						this.player.bullets.fire.reserve = 4
				}

				this.player.bulletTextIn.setText(String(this.player.bullets[this.player.getData('equip')].in))
			}
		})

	
		this.socket.on('newPlayerData', function(player){
			self.players.getChildren().forEach(function(childPlayer){
				if(childPlayer.getData('playerID') === player.playerID){
					childPlayer.setPosition(player.x, player.y)
					childPlayer.body.setVelocityX(player.dx)
					childPlayer.body.setVelocityY(player.dy)

					childPlayer.setFlip(player.flip)
					childPlayer.setEquip(player.equip)
					childPlayer.getByName('gun').setRotation(player.gunRotation)
					childPlayer.setData('kills', player.kills)
					childPlayer.setData('health', player.health)

					player.startQueue.forEach((startEvent) => {

						if(startEvent == 'shoot'){
							childPlayer.shoot()
						} else if(startEvent == 'ghost') {
							childPlayer.ghost()
						} else {
							childPlayer.play(startEvent)
						}
						
						
					})

					childPlayer.drawHealthBar()
					

				}	
			})
		})

	
	}

	update(t, dt){

		if(!this.player || !this.connected){
			return
		}
		
		
		this.playerController.update(dt)
	
		
			this.socket.emit('playerMoved', {
				x: this.player.x,
				y: this.player.y,
				dx: this.player.body.velocity.x,
				dy: this.player.body.velocity.y,
				playerID: this.socket.id,
				startQueue: this.player.getData('startQueue'),
				gunRotation: this.player.getByName('gun').rotation,
				equip: this.player.getData('equip'),
				flip: this.player.getData('flip'),
				ghost: this.player.getData('ghost'),
				kills: this.player.getData('kills'),
				health: this.player.getData('health')
			})

			this.player.setData('startQueue', [])

			



	}

	drawLeaderboard(){
		this.leaderboard.clear(true, true)
		let length = this.players.getChildren().length
        for(let i = 0; i < length; i++) {
			let string =  this.players.getChildren()[i].getData('name') + '  ' + this.players.getChildren()[i].getData('kills')
			let y = i * 20 + 30
			this.leaderboard.add(this.add.text(300, y, string).setScrollFactor(0, 0), true)
        }
    }



	addPlayer(player){
		this.player = new Player(this, player.x, player.y)
		
		this.playerController = new PlayerController(this.player, this.cursors, this)
		this.player.setData('playerID', player.playerID)
		this.player.setData('name', player.name)
		this.players.add(this.player)

		
	}

	addOtherPlayer(player){
		let otherPlayer = new Opponent(this, player.x, player.y)

		otherPlayer.setData('playerID', player.playerID)
		otherPlayer.setData('name', player.name)
		this.players.add(otherPlayer)
	}

	
}

