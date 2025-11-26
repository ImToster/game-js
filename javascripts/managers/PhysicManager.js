class PhysicManager {
    constructor() {
    }

    update(obj) {
        // if (obj.move_x === 0 && obj.move_y === 0){
        //     return "stop"
        // }


        const newX = obj.pos_x + Math.floor(obj.move_x * obj.speed)
        const newY = obj.pos_y + Math.floor(obj.move_y * obj.speed)

        const passable_ts = mapManager.isPassableAt(newX + obj.size_x / 2, newY + obj.size_y / 2)
        const e = this.entityAtXY(obj, newX, newY)

        if (e !== null && obj.onTouchEntity)
            obj.onTouchEntity(e)

        if (!passable_ts && obj.onTouchWall)
            obj.onTouchWall()
        if (passable_ts && (e === null || e.passable)){
            obj.pos_x = newX
            obj.pos_y = newY
        }
        else
            return "break"
        return "move"
    }

    entityAtXY(obj, x, y, type = Object) {
        for (const entity of gameManager.entities){
            let shift = 0
            if (entity instanceof Darkness)
                shift = mapManager.tSize.x
            if (entity !== obj && entity instanceof type){
                if (x + obj.size_x + shift < entity.pos_x || y + obj.size_y + shift < entity.pos_y ||
                x > entity.pos_x + entity.size_x + shift || y > entity.pos_y + entity.size_y + shift)
                    continue
                return entity
            }
        }
        return null
    }

    playerAtXY(obj, x, y) {
        return !(x + obj.size_x < gameManager.player.pos_x || y + obj.size_y < gameManager.player.pos_y ||
            x > gameManager.player.pos_x + gameManager.player.size_x || y > gameManager.player.pos_y + gameManager.player.size_y);

    }
}