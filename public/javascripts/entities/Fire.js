class Fire extends Entity{
    static size_x = 16;
    static size_y = 16;
    constructor(lifetime = null) {
        super();
        if (lifetime !== null)
            setTimeout(() => this.kill(), lifetime)
        this.size_x = 16
        this.size_y = 16
        this.anim = 0
        this.damage = 1
        this.readyToDamage = true
        this.passable = true
    }

    update(){
        physicManager.update(this)
    }

    doDamage(obj){
        if (this.readyToDamage){
            this.readyToDamage = false
            obj.getDamage(this.damage)
            setTimeout(() => this.readyToDamage = true, 500)
        }
    }


    draw(){
        spriteManager.drawSprite(ctx, `fire${Math.floor(this.anim / 2)}`, this.pos_x, this.pos_y)
        this.anim = (this.anim + 1) % 6
    }

    kill(){
        gameManager.kill(this)
    }

    onTouchEntity(obj) {
        if (obj instanceof Player){
            this.doDamage(obj)
        }
    }
    onTouchWall(){
        if (this.speed){
            soundManager.playWorldSound("fire_strike", this.pos_x, this.pos_y)
            this.speed = 0
            setTimeout(() => this.kill(), 5000)
        }
    }

}