

class StateMachine{
    constructor(name, context){

        this.name = name
        this.context = context
        this.currentState
        this.states = {}
        this.stateChangeQueue = []


    }

    addState(stateName, config){

        this.states[stateName] = {name: stateName}
        var self = this

        Object.keys(config).forEach(function(key){
                self.states[stateName][key] = config[key].bind(self.context)
        })

    }

    setInitialState(stateName){
        this.currentState = this.states[stateName]
        this.currentState.onEnter()
    }
    
    setState(stateName){

        if(this.currentState.name == stateName){
            console.log('already in this state')
            return
        }

        if(this.isChangingState){
            this.stateChangeQueue.push(stateName)
        }

        this.isChangingState = true
        
        if(this.currentState.onExit){
            this.currentState.onExit()
        }
       
        this.currentState = this.states[stateName]

        if(this.currentState.onEnter){
            this.currentState.onEnter()
        }

        this.isChangingState = false
    }


    update(dt){

        if(this.stateChangeQueue.length > 0){
            this.setState(this.stateChangeQueue.shift())
            return
        }

        if(this.currentState && this.currentState.onUpdate){
            this.currentState.onUpdate(dt)
        }

    }
}