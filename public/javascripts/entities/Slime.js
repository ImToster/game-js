class Slime extends Enemy{
    constructor() {
        super();
        this.isAttacking = false
        this.isDying = false
        this.ready_to_attack = true
        this.speed = 1

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
                gameManager.player.getGold(500)
                gameManager.kill(this)
            }, 1000)
        }
    }

    update(){
        if (this.isSleeping || this.isAttacking || this.isDying)
            return

        if (this.ready_to_attack){
            if (this.playerIsNear())
                this.attack()
            else {
                const dirs = this.movement.getDirToPlayer()
                if (dirs === null){
                    this.move_x = 0
                    this.move_y = 0
                } else {
                    this.move_x = dirs.dir_x
                    this.move_y = dirs.dir_y
                }
            }
        } else {
            const dirs = this.movement.getDirFromPlayer()
            if (dirs === null){
                this.move_x = 0
                this.move_y = 0
            } else {
                this.move_x = dirs.dir_x
                this.move_y = dirs.dir_y
            }
        }

        physicManager.update(this)
    }

    playerIsNear(){
        return (gameManager.player.pos_y - this.pos_y) ** 2 + (gameManager.player.pos_x - this.pos_x) ** 2 < (mapManager.tSize.x * 2) ** 2
    }

    attack(){
        this.isAttacking = true
        this.ready_to_attack = false
        setTimeout(() => this.isAttacking = false, 1950)
        setTimeout(() => this.ready_to_attack = true, 5000)
        setTimeout(() => {
            soundManager.playWorldSound("slime_fire", this.pos_x, this.pos_y)
            let fire
            for (const dir_x of [-1, 0, 1])
                for (const dir_y of [-1, 0, 1]) {
                    if (dir_x === 0 && dir_y === 0)
                        continue
                    fire = new Fire(1500)
                    fire.pos_x = this.pos_x + dir_x * mapManager.tSize.x
                    fire.pos_y = this.pos_y + dir_y * mapManager.tSize.y
                    gameManager.entities.unshift(fire)
                }
        }, 500)

        setTimeout(() => {
            let fire
            for (const dir_x of [-2, 2])
                for (const dir_y of [-1, 0, 1]) {
                    if (dir_x === 0 && dir_y === 0)
                        continue
                    fire = new Fire(1000)
                    fire.pos_x = this.pos_x + dir_x * mapManager.tSize.x
                    fire.pos_y = this.pos_y + dir_y * mapManager.tSize.y
                    gameManager.entities.unshift(fire)
                }
            for (const dir_x of [-1, 0, 1])
                for (const dir_y of [-2, 2]) {
                    fire = new Fire(1000)
                    fire.pos_x = this.pos_x + dir_x * mapManager.tSize.x
                    fire.pos_y = this.pos_y + dir_y * mapManager.tSize.y
                    gameManager.entities.unshift(fire)
                }
        }, 1500)
    }

    draw(){
        if (this.isSleeping)
            return
        let sprite_name

        if (this.isDying){
            sprite_name = `slime_death${Math.floor(this.dying_anim / 2)}_${this.turn}`
            this.dying_anim = (this.dying_anim + 1) % 20
        }
        else if (this.isAttacking){
            sprite_name = `slime_attack${Math.floor(this.attacking_anim / 2)}_${this.turn}`
            this.attacking_anim = (this.attacking_anim + 1) % 20
        }
        else {
            if (this.move_x === 1)
                this.turn = "r"
            else if (this.move_x === -1)
                this.turn = "l"
            sprite_name = `slime_walking${Math.floor(this.walking_anim / 2)}_${this.turn}`
            this.walking_anim = (this.walking_anim + 1) % 20
        }

        spriteManager.drawSprite(ctx, (sprite_name), this.pos_x, this.pos_y)
    }


}