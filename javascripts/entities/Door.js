class Door extends Entity{
    constructor() {
        super();
        this.move_x = 0
        this.move_y = 0
        this.speed = 0
        this.passable = false
        this.is_opening = false
    }

    draw(){
        spriteManager.drawSprite(ctx, `door${Number(this.passable)}`, this.pos_x, this.pos_y - mapManager.tSize.y * this.passable)
    }

    update(){}

    open(){
        if (this.passable === false && gameManager.player.hasSilverKey && gameManager.player.hasGoldKey && !this.is_opening){
            this.is_opening = true
            soundManager.playWorldSound("door_open", this.pos_x, this.pos_y)
            setTimeout(() => {
                this.passable = true
                this.is_opening = false
            }, 1500)

        }

    }


    kill(){
        gameManager.kill(this)
    }

}