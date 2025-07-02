class Darkness extends Entity{
    constructor() {
        super();
        this.move_x = 0
        this.move_y = 0
        this.speed = 0
        this.passable = true
    }

    draw(){
        if (!mapManager.isVisible(this.pos_x, this.pos_y, this.size_x, this.size_y))
            return
        ctx.fillRect(this.pos_x - mapManager.view.x, this.pos_y - mapManager.view.y, this.size_x, this.size_y)
    }

    update(){}


    kill(){
        soundManager.play("darkness")
        for (const entity of gameManager.entities)
            if (entity instanceof Enemy &&
                (entity.pos_x < this.pos_x + this.size_x && entity.pos_x > this.pos_x &&
                    entity.pos_y < this.pos_y + this.size_y && entity.pos_y > this.pos_y))
                entity.isSleeping = false

        gameManager.kill(this)
    }

}