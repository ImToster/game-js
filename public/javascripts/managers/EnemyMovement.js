class EnemyMovement{
    nodes = null
    xCount = 0
    yCount = 0

    dirs = [-1, 0, 1]

    constructor(enemy) {
        this.enemy = enemy

        this.xCount = mapManager.xCount
        this.yCount = mapManager.yCount

        this.nodes = new Array(this.yCount)
        for (let y = 0; y < this.yCount; y++){
            this.nodes[y] = new Array(this.xCount).fill(null);
            for (let x = 0; x < this.xCount; x++)
                if (mapManager.isPassableTile(x, y))
                    this.nodes[y][x] = {
                        x: x,
                        y: y,
                        costSoFar: undefined,
                        estimatedTotalCost: undefined,
                        from: null
                    }
        }
    }


    getDirToPlayer(){
        return this.aStar(this.euclideanDistance,
            (open, current, start, finish) => {
                return current === finish
            })
    }

    getDirFromPlayer(){
        return this.aStar(
            (node, finish, start) => {
                return  -this.euclideanDistance(node, finish)
            },
            (open, current, start, finish) => {
                return start.estimatedTotalCost - current.estimatedTotalCost > 25
            })
    }

    getDirToSeePlayer(){
        return this.aStar(
            (node, finish, start) => {
                return  -this.euclideanDistance(node, start)
            },
            (open, current, start) => {
                return start.estimatedTotalCost - current.estimatedTotalCost < 9
            })
    }


    aStar(heuristic, stopCondition){
        const x_player = Math.floor((gameManager.player.pos_x + gameManager.player.size_x / 2) / mapManager.tSize.x)
        const y_player = Math.floor((gameManager.player.pos_y + gameManager.player.size_y / 2) / mapManager.tSize.y)
        const finish = this.nodes[y_player][x_player]

        const x_start = Math.floor((this.enemy.pos_x + this.enemy.size_x / 2) / mapManager.tSize.x)
        const y_start = Math.floor((this.enemy.pos_y + this.enemy.size_y / 2) / mapManager.tSize.y)
        const start = this.nodes[y_start][x_start]

        if (start === finish)
            return {dir_x: 0, dir_y: 0}

        start.costSoFar = 0
        start.estimatedTotalCost = heuristic(start, finish)

        let open = [start]
        let closed = []

        let dirFound = false
        let toCost, dir_x, dir_y, to
        let current = start
        let x = x_start
        let y = y_start
        while (open.length > 0){
            current = this.getEstimatedTotalCost(open)
            x = current.x
            y = current.y
            if (stopCondition(open, current, start, finish)){
                dirFound = true
                break
            }
            open = open.filter(node => node !== current)
            closed.push(current)
            for (dir_x of this.dirs)
                for (dir_y of this.dirs) {
                    if (dir_x === 0 && dir_y === 0)
                        continue
                    x = current.x
                    y = current.y

                    if (Math.abs(dir_x * dir_y) === 1)
                        if (this.nodes[y][x + dir_x] === null || this.nodes[y + dir_y][x] === null)
                            continue
                    x += dir_x
                    y += dir_y
                    if (this.nodes[y][x] !== null){
                        to = this.nodes[y][x]
                        toCost = current.costSoFar + (Math.abs(dir_x) + Math.abs(dir_y))

                        if (closed.includes(to) && toCost >= to.costSoFar) {
                            continue
                        }
                        if (!closed.includes(to) || toCost < to.costSoFar){
                            to.from = current
                            to.costSoFar = toCost
                            to.estimatedTotalCost = toCost + heuristic(to, finish)
                            if (!open.includes(to))
                                open.push(to)
                        }
                    }
                }
        }

         if (!dirFound)
             return null

        while (current.from !== start){
            current = current.from
        }

        dir_x = 0
        dir_y = 0
        if (current.x > start.x)
            dir_x = 1
        else if (current.x < start.x)
            dir_x = -1
        if (current.y > start.y)
            dir_y = 1
        else if (current.y < start.y)
            dir_y = -1
        return {dir_x, dir_y}
    }


    euclideanDistance(node, finish, start){
        return (node.x - finish.x) ** 2 + (node.y - finish.y) ** 2
    }

    getEstimatedTotalCost(nodes){
        let minEstimatedTotalCost = nodes[0].estimatedTotalCost
        let res = nodes[0]
        for (const node of nodes)
            if (node.estimatedTotalCost < minEstimatedTotalCost){
                minEstimatedTotalCost = node.estimatedTotalCost
                res = node
            }
        return res
    }

}