class Gold extends Entity{
    constructor() {
        super();
        this.move_x = 0
        this.move_y = 0
        this.speed = 0
        this.passable = true
        this.value = 100
    }

    draw(){
        spriteManager.drawSprite(ctx, "gold", this.pos_x, this.pos_y)
    }

    update(){}


    kill(){
        gameManager.kill(this)
    }

}