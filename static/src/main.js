var game = new Phaser.Game({
	width: 400,
	height: 300,
	parent: 'main',
	type: Phaser.AUTO,
	backgroundColor: "black",
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	physics: {
		default: "arcade",
		arcade: {
			debug: false,
			gravity: {y: 400}
		}

	},

	render: {
		pixelArt: true
	},
	
	dom: {
		createContainer: true
	},

	scene: [TitleScreen, Level]
});
	
	
	
	
	



