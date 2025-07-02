class HealthPotion extends Entity{
    constructor() {
        super();
        this.move_x = 0
        this.move_y = 0
        this.speed = 0
        this.passable = true
    }

    draw(){
        spriteManager.drawSprite(ctx, "health_potion", this.pos_x, this.pos_y)
    }

    update(){}

    kill(){
        gameManager.kill(this)
    }
}