class MapManager{
    mapData = null
    tLayers = []
    xCount = 0
    yCount = 0
    tSize =  {x: 16, y: 16}
    mapSize = {x: 16, y: 16}
    tilesets = []
    imgLoadCount = 0
    imgLoaded = false
    jsonLoaded = false
    view = {
        x: 0,
        y: 0,
        w: null,
        h: null
    }

    constructor(w, h) {
        this.view.w = w
        this.view.h = h
    }

    loadMap(path) {
        this.mapData = null
        this.tLayers.length = 0
        this.tilesets.length = 0
        this.imgLoadCount = 0
        this.imgLoaded = false
        this.jsonLoaded = false
        const request = new XMLHttpRequest()
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200)
                this.parseMap(request.responseText)
        }
        request.open("GET", `/public/map/${path}`, true)
        request.send()
    }

    parseMap(tilesJSON) {
        this.mapData = JSON.parse(tilesJSON)
        for (const layer of this.mapData.layers){
            if (layer.type === "tilelayer"){
                this.tLayers.push(layer)
            }
        }
        this.xCount = this.mapData.width
        this.yCount = this.mapData.height
        this.tSize.x = this.mapData.tilewidth
        this.tSize.y = this.mapData.tileheight
        this.mapSize.x = this.xCount * this.tSize.x
        this.mapSize.y = this.yCount * this.tSize.y
        for (const tileset of this.mapData.tilesets)
            this.loadTileset(tileset.source, tileset.firstgid)
        this.jsonLoaded = true
    }

    loadTileset(path, firstgid) {
        const request = new XMLHttpRequest()
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200)
                this.parseTileset(request.responseText, firstgid)
        }
        request.open("GET", `/public/map/${path}`, true)
        request.send()
    }

    parseTileset(tilesetJSON, firstgid){
        const tileset = JSON.parse(tilesetJSON)
        const img = new Image()
        img.onload = () => {
            this.imgLoadCount++
            if (this.imgLoadCount === this.mapData.tilesets.length)
                this.imgLoaded = true
        }
        img.src = `/public/map/${tileset.image}`
        this.tilesets.push({
            firstgid: firstgid,
            image: img,
            name: tileset.name,
            xCount: Math.floor(tileset.imagewidth / this.tSize.x),
            yCount: Math.floor(tileset.imageheight / this.tSize.y)
        })
    }

    draw(ctx){
        if (!this.imgLoaded || !this.jsonLoaded)
            setTimeout(() => this.draw(ctx), 100)
        else {
            for (const tLayer of this.tLayers)
                for (let i = 0; i < tLayer.data.length; i++)
                    if (tLayer.data[i] !== 0){
                        const tile = this.getTile(tLayer.data[i])
                        let pX = (i % this.xCount) * this.tSize.x
                        let pY = Math.floor(i / this.xCount) * this.tSize.y
                        if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                            continue
                        pX -= this.view.x
                        pY -= this.view.y
                        ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y, pX, pY, this.tSize.x, this.tSize.y)
                    }
        }
    }

    getTile(tileindex){
        const tile = {
            img: null,
            px: 0,
            py: 0
        }
        const tileset = this.getTileset(tileindex)
        tile.img = tileset.image
        const id = tileindex - tileset.firstgid
        const x = id % tileset.xCount
        const y = Math.floor(id / tileset.xCount)
        tile.px = x * this.tSize.x
        tile.py = y * this.tSize.y
        return tile
    }

    getTileset(tileindex){
        for (const tileset of this.tilesets){
            if (tileset.firstgid <= tileindex) {
                return tileset
            }
        }
    }

    isVisible(x, y, width, height){
        return !(x + width < this.view.x || y + height < this.view.y ||
            x > this.view.x + this.view.w || y > this.view.y + this.view.h);
    }

    isPassableAt(x, y) {
        const idx = Math.floor(y / this.tSize.y) * this.xCount + Math.floor(x / this.tSize.x)
        for (const tLayer of this.tLayers){
            if (this.isWall(tLayer.data[idx]))
                return false
        }

        return true
    }

    isPassableTile(x, y) {
        const idx = y * this.xCount + x
        for (const tLayer of this.tLayers){
            if (this.isWall(tLayer.data[idx])){
                return false
            }
        }
        return true
    }

    isWall(ts){
        return ts === 41 || (31 <= ts && ts <= 39) || (61 <= ts && ts <= 69)  ||
            (374 <= ts && ts <= 380) || (404 <= ts && ts <= 410) || ts === 245 || ts === 246 || ts === 275 || ts === 276 ||
            ts === 252 || ts === 312 || (481 <= ts && ts <= 508) || (530 <= ts && ts <= 538)
    }

    parseEntities() {
        if (!this.imgLoaded || !this.jsonLoaded)
            setTimeout(() => this.parseEntities(), 100)
        else {
            for (const layer of this.mapData.layers)
                if (layer.type === 'objectgroup')
                    for (const entity of layer.objects){
                        try {
                            const obj = new gameManager.factory[entity.type]()
                            obj.pos_x = entity.x
                            obj.pos_y = entity.y
                            obj.size_x = entity.width
                            obj.size_y = entity.height
                            gameManager.entities.push(obj)
                            if (entity.type === "Player"){
                                gameManager.initPlayer(obj)
                            }
                        } catch (ex) {
                            console.log("Error while creating: [" + entity.gid  + "]" + entity.type + ", " + ex)
                        }
                    }

            for (const entity of gameManager.entities){
                if (entity instanceof Enemy){
                    entity.movement = new EnemyMovement(entity)
                }
            }
        }
    }

    centerAt(x, y){
        if (x < this.view.w / 2)
            this.view.x = 0
        else
            if (x > this.mapSize.x - this.view.w / 2)
                this.view.x = this.mapSize.x - this.view.w
            else
                this.view.x = x - (this.view.w / 2)

        if (y < this.view.h / 2)
            this.view.y = 0
        else
            if (y > this.mapSize.y - this.view.h/ 2)
                this.view.y = this.mapSize.y - this.view.h
            else
                this.view.y = y - (this.view.h / 2)
    }
}