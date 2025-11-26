class Player extends Entity{
    constructor() {
        super();
        this.health = 3
        this.gold = 0
        this.speed = 3
        this.isGettingDamage = false
        this.isAttacking = false
        this.hasSilverKey = false
        this.hasGoldKey = false
        this.passable = true

        this.attacking_anim = 0
        this.standing_anim = 0
        this.walking_anim = 0
        this.dying_anim = 0
        this.pain_anim = 0
        this.turn = "r"
    }

    draw(){
        let sprite_name
        let shiftX = 0
        const shiftY = - mapManager.tSize.y


        if (this.isDying){
            sprite_name = `player_death${Math.floor(this.dying_anim / 2)}_${this.turn}`
            this.dying_anim = (this.dying_anim + 1) % 12
        }
        else if (this.isGettingDamage){
            sprite_name = `player_pain${Math.floor(this.pain_anim / 2)}_${this.turn}`
            this.pain_anim = (this.pain_anim + 1) % 4
        }
        else if (this.isAttacking){
            sprite_name = `player_attack${Math.floor(this.attacking_anim / 2)}_${this.turn}`
            this.attacking_anim = (this.attacking_anim + 1) % 12
        }
        else if (this.move_x || this.move_y){
            if (this.move_x === 1)
                this.turn = "r"
            else if (this.move_x === -1)
                this.turn = "l"
            sprite_name = `player_walking${Math.floor(this.walking_anim / 2)}_${this.turn}`
            this.walking_anim = (this.walking_anim + 1) % 14
        }
        else{
            sprite_name = `player_standing${Math.floor(this.standing_anim / 2)}_${this.turn}`
            this.standing_anim = (this.standing_anim + 1) % 12
        }

        if (this.turn === "l")
            shiftX = - this.size_x
        try{
            spriteManager.drawSprite(ctx, (sprite_name), this.pos_x + shiftX, this.pos_y + shiftY)
        } catch (e){
            console.log(e, sprite_name)
        }

    }

    attack(){
        if (this.isGettingDamage)
            return
        this.isAttacking = true
        this.move_x = 0
        this.move_y = 0
        this.attacking_anim = 0
        setTimeout(() => this.isAttacking = false, 550)
        setTimeout(() => {
            if (!this.isAttacking)
                return
            let shiftX = this.size_x
            if (this.turn === "l")
                shiftX = -this.size_x
            const enemy = physicManager.entityAtXY({size_x: 0, size_y: 0}, this.pos_x + this.size_x / 2 + shiftX,
                this.pos_y + this.size_y / 2, Enemy)
            if (enemy){
                soundManager.play("player_attack_hit")
                enemy.kill()
            } else
                soundManager.play("player_attack_miss")

        }, 300)
    }

    update(){
        physicManager.update(this)
    }

    heal(){
        this.health += 1
        if (this.health > 3)
            this.health = 3
    }

    getDamage(damage){
        if (this.isDying || this.isGettingDamage)
            return
        soundManager.play("player_pain")
        this.isGettingDamage = true
        setTimeout(() => this.isGettingDamage = false, 150)
        if (this.isAttacking){
            this.isAttacking = false
            this.attacking_anim = 0
        }
        if (this.health - damage <= 0){
            this.health = 0
            this.kill()
        }

        else
            this.health -= damage
    }

    kill(){
        if (!this.isDying) {
            this.isDying = true
            setTimeout(() => gameManager.failLevel(),550)
        }
    }

    onTouchEntity(obj) {
        if (obj instanceof Gold){
            this.getGold(obj.value)
            obj.kill()
        }
        else if (obj instanceof Fire){
            obj.doDamage(this)
        }
        else if (obj instanceof GoldKey){
            this.hasGoldKey = true
            soundManager.play("key")
            obj.kill()
        }
        else if (obj instanceof SilverKey){
            this.hasSilverKey = true
            soundManager.play("key")
            obj.kill()
        }
        else if (obj instanceof Darkness){
            obj.kill()
        }
        else if (obj instanceof Door){
            obj.open()
        }
        else if (obj instanceof HealthPotion){
            this.heal(1)
            soundManager.play("potion")
            obj.kill()
        }
        else if (obj instanceof SpeedPotion){
            this.speed += 1
            soundManager.play("potion")
            obj.kill()
        }
        else if (obj instanceof Finish){
            gameManager.passLevel()
        }
    }

    getGold(value){
        soundManager.play("gold")
        this.gold += value
    }
}