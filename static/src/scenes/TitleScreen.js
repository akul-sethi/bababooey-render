class TitleScreen extends Phaser.Scene{
    constructor(){
        super("TitleScreen");
		
    }
    

    preload(){
        this.load.html('login', 'static/assets/html/login.html')
        this.load.image('vaperwave', 'static/assets/enviroment/vaperwave.png')
        this.load.audio('title', ['static/assets/sound/title.m4a'])
        this.load.html('instructions', 'static/assets/html/instructions.html')
    }

    create(){
		
        
        this.background = this.add.tileSprite(0, 50, 1440, 240, 'vaperwave').setOrigin(0, 0)
        // this.reverseBackground = this.add.tileSprite(720, 0, -720, 240, 'vaperwave').setOrigin(0, 0)
     
    
        let login = this.add.dom(160, 150).createFromCache('login')
        let instructions = this.add.dom(200, 30).createFromCache('instructions')

        login.addListener('click')

        login.on('click', (event) => {
            if(event.target.name === 'join'){
                this.scene.start('Level', {username: login.getChildByName('username').value})
                this.background.destroy()
            }
        })

        let music = this.sound.add('title')

        music.play({loop: true})
        
       
        
    }

    update(){
        this.background.tilePositionX += 0.5
        // this.reverseBackground.tilePositionX += 0.3
    }
    
}