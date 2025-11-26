class Orc extends Enemy{
    constructor() {
        super();
        this.isAttacking = false
        this.isDying = false
        this.ready_to_attack = true
        this.speed = 2

        this.attacking_anim = 0
        this.standing_anim = 0
        this.walking_anim = 0
        this.dying_anim = 0
        this.turn = "r"
    }

    kill(){
        if (!this.isDying) {
            this.isDying = true
            setTimeout(() => {
                gameManager.player.getGold(1000)
                gameManager.kill(this)
            }, 1000)
        }
    }

    update(){
        if (this.isSleeping || this.isAttacking || this.isDying)
            return

        if (this.playerIsNear()){
            if (this.ready_to_attack){
                if (this.sectionToPlayerIsPassable())
                    this.attack()
                else
                    this.goToPlayer()
            }
            else {
                this.goFromPlayer()
            }
        } else if (this.playerIsFar()) {
            this.goToPlayer()
        } else {
            this.move_x = 0
            this.move_y = 0
            if (this.ready_to_attack){
                if (this.sectionToPlayerIsPassable())
                    this.attack()
                else
                    this.goToPlayer()
            }
        }
        physicManager.update(this)
    }

    goToPlayer(){
        const dirs = this.movement.getDirToPlayer()
        if (dirs === null){
            this.move_x = 0
            this.move_y = 0
        } else {
            this.move_x = dirs.dir_x
            this.move_y = dirs.dir_y
        }
    }

    goFromPlayer(){
        const dirs = this.movement.getDirFromPlayer()
        if (dirs === null){
            this.move_x = 0
            this.move_y = 0
        } else {
            this.move_x = dirs.dir_x
            this.move_y = dirs.dir_y
        }
    }

    getDirToPlayer(from_x, from_y){
        const distance = Math.sqrt((gameManager.player.pos_y + gameManager.player.size_y / 2 - from_y) ** 2
            + (gameManager.player.pos_x + gameManager.player.size_x / 2 - from_x) ** 2)
        const dir_x = (gameManager.player.pos_x + gameManager.player.size_x / 2 - from_x) / distance
        const dir_y = (gameManager.player.pos_y + gameManager.player.size_y / 2 - from_y) / distance
        return {dir_x, dir_y}
    }

    sectionToPlayerIsPassable(){
        let shiftX
        if (this.pos_x > gameManager.player.pos_x){
            if (mapManager.isPassableAt(this.pos_x - this.size_x + Fire.size_x / 2, this.pos_y + Fire.size_y / 2)){
                shiftX = - this.size_x
            } else if (mapManager.isPassableAt(this.pos_x + this.size_x + Fire.size_x / 2, this.pos_y + Fire.size_y / 2)) {
                shiftX = this.size_x
            } else
                return;

        } else {
            if (mapManager.isPassableAt(this.pos_x + this.size_x + Fire.size_x / 2, this.pos_y + Fire.size_y / 2)){
                shiftX = this.size_x
            } else if (mapManager.isPassableAt(this.pos_x - this.size_x + Fire.size_x / 2, this.pos_y + Fire.size_y / 2)) {
                shiftX = - this.size_x
            } else
                return;
        }

        if (physicManager.playerAtXY(Fire,  this.pos_x + shiftX,  this.pos_y))
            return true



        const from_x = this.pos_x + shiftX + this.size_x / 2
        const from_y = this.pos_y + this.size_y / 4

        const {dir_x, dir_y} =  this.getDirToPlayer(from_x, from_y)
        const step_x = dir_x * 2
        const step_y = dir_y * 2

        let condition_x, condition_y
        if (dir_x > 0)
            condition_x = (x) => x <= gameManager.player.pos_x + gameManager.player.size_x / 2
        else
            condition_x = (x) => x >= gameManager.player.pos_x + gameManager.player.size_x / 2

        if (dir_y > 0)
            condition_y = (y) => y <= gameManager.player.pos_y + gameManager.player.size_y / 2
        else
            condition_y = (y) => y >= gameManager.player.pos_y + gameManager.player.size_y / 2

        let x = from_x
        let y = from_y
        while (condition_x(x) && condition_y(y)) {
            if (!mapManager.isPassableAt(Math.floor(x), Math.floor(y)))
                return false
            x += step_x
            y += step_y
        }
        return true
    }

    playerIsNear(){
        return (gameManager.player.pos_y - this.pos_y) ** 2 + (gameManager.player.pos_x - this.pos_x) ** 2 < (mapManager.tSize.x * 5) ** 2
    }

    playerIsFar(){
        return (gameManager.player.pos_y - this.pos_y) ** 2 + (gameManager.player.pos_x - this.pos_x) ** 2 > (mapManager.tSize.x * 7) ** 2
    }

    attack(){
        this.isAttacking = true
        this.ready_to_attack = false
        setTimeout(() => this.isAttacking = false, 1950)
        setTimeout(() => this.ready_to_attack = true, 5000)
        setTimeout(() => {
            this.createFire()
        }, 500)
        setTimeout(() => {
            this.createFire()
        }, 1500)
    }

    createFire(){
        if (this.isDying)
            return
        let shiftX
        if (this.pos_x > gameManager.player.pos_x){
            if (mapManager.isPassableAt(this.pos_x - this.size_x + Fire.size_x / 2, this.pos_y + Fire.size_y / 2)){
                shiftX = - this.size_x
                this.turn = "l"
            } else if (mapManager.isPassableAt(this.pos_x + this.size_x + Fire.size_x / 2, this.pos_y + Fire.size_y / 2)) {
                shiftX = this.size_x
                this.turn = "r"
            } else
                return;

        } else {
            if (mapManager.isPassableAt(this.pos_x + this.size_x + Fire.size_x / 2, this.pos_y + Fire.size_y / 2)){
                shiftX = this.size_x
                this.turn = "r"
            } else if (mapManager.isPassableAt(this.pos_x - this.size_x + Fire.size_x / 2, this.pos_y + Fire.size_y / 2)) {
                shiftX = - this.size_x
                this.turn = "l"
            } else
                return;
        }

        const fire = new Fire()
        fire.pos_x = this.pos_x + shiftX
        fire.pos_y = this.pos_y
        const {dir_x, dir_y} = this.getDirToPlayer(fire.pos_x + fire.size_x / 2, fire.pos_y + fire.size_y / 2)
        fire.move_x = dir_x
        fire.move_y = dir_y
        fire.speed = 6
        soundManager.playWorldSound("fireball", fire.pos_x, fire.pos_y)
        gameManager.entities.unshift(fire)
    }

    draw(){
        if (this.isSleeping)
            return
        let sprite_name

        if (this.isDying){
            sprite_name = `orc_death${Math.floor(this.dying_anim / 2)}_${this.turn}`
            this.dying_anim = (this.dying_anim + 1) % 20
        }
        else if (this.isAttacking){
            sprite_name = `orc_attack${Math.floor(this.attacking_anim / 2)}_${this.turn}`
            this.attacking_anim = (this.attacking_anim + 1) % 20
        }
        else if (this.move_x || this.move_y){
            if (this.move_x === 1)
                this.turn = "r"
            else if (this.move_x === -1)
                this.turn = "l"
            sprite_name = `orc_walking${Math.floor(this.walking_anim / 2)}_${this.turn}`
            this.walking_anim = (this.walking_anim + 1) % 20
        } else {
            sprite_name = `orc_standing${Math.floor(this.standing_anim / 2)}_${this.turn}`
            this.standing_anim = (this.standing_anim + 1) % 20
        }

        spriteManager.drawSprite(ctx, (sprite_name), this.pos_x - 8, this.pos_y)
    }


}