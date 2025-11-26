class EventsManager{
    bind = []
    action = []
    playerManagementIsOn = true
    button_sound = document.querySelector('#sound')

    setup() {
        this.bind[87] = 'up'
        this.bind[65] = 'left'
        this.bind[83] = 'down'
        this.bind[68] = 'right'
        this.bind[32] = 'attack'
        this.bind[13] = 'ok'
        this.bind[27] = 'retry'

        document.body.addEventListener("keydown", this.onKeyDown.bind(this))
        document.body.addEventListener("keyup", this.onKeyUp.bind(this))
    }

    onKeyDown(event){
        const action = this.bind[event.keyCode]
        if (action && this.playerManagementIsOn && gameManager.gameIsOn){
            this.action[action] = true
        } else if (!gameManager.gameIsOn){
            if (action === 'ok'){
                if (gameManager.level_passed){
                    if (gameManager.level === 1)
                        gameManager.continue()
                    else
                        gameManager.retry()
                }
                else
                    gameManager.retry()
            } else if (action === 'retry')
                gameManager.retry()
        }
    }

    onKeyUp(event){
        const action = this.bind[event.keyCode]
        if (action && this.playerManagementIsOn){
            this.action[action] = false
        }
    }

    onFocusNickname(){
        this.playerManagementIsOn = false
    }

    onBlurNickname(){
        this.playerManagementIsOn = true
    }


    turnSound(){
        this.button_sound.blur()
        if (!soundManager.isOn){
            this.button_sound.style.border = "4px solid green"
            if (!soundManager.loaded)
                soundManager.loadAll()
            soundManager.isOn = true
        } else {
            this.button_sound.style.border = "4px solid red"
            soundManager.stopAll()
            soundManager.isOn = false
        }
    }
}