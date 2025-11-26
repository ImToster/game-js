class SpriteManager{
    image = new Image()
    sprites = []
    imgLoaded = false
    jsonLoaded = false


    loadAtlas(atlasJSON, atlasIMG) {
        const request = new XMLHttpRequest()
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200)
                this.parseAtlas(request.responseText)
        }
        request.open("GET", `/public/atlas/${atlasJSON}`, true)
        request.send()
        this.loadImg(atlasIMG)
    }

    parseAtlas(atlasJSON){
        const atlas = JSON.parse(atlasJSON)
        for (name in atlas.frames){
            const frame = atlas.frames[name].frame
            this.sprites.push({
                name: name,
                x: frame.x,
                y: frame.y,
                w: frame.w,
                h: frame.h
            })
        }
        this.jsonLoaded = true
    }

    loadImg(atlasIMG){
        this.image.onload = () => this.imgLoaded = true
        this.image.src = `/public/atlas/${atlasIMG}`
    }

    drawSprite(ctx, name, x, y) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => this.drawSprite(ctx, name, x, y), 100)
        }
        else {
            const sprite = this.getSprite(name)
            if (!mapManager.isVisible(x, y, sprite.w, sprite.h))
                return
            x -= mapManager.view.x
            y -= mapManager.view.y
            ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h)
        }
    }

    getSprite(name){
        for (const sprite of this.sprites) {
            if (sprite.name === name)
                return sprite
        }
        return null
    }
}