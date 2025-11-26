class GameManager{
    factory = {}
    entities = []
    player = null
    laterKill = []
    timer = null
    modal = document.querySelector('#modal')
    tableRecords = document.querySelector('#table-records')
    nickname = document.querySelector('#nickname')
    hint = document.querySelector('#hint')
    level = 1
    level_passed = false
    gameIsOn = false


    initPlayer(obj){
        this.player = obj
    }

    kill(obj){
        this.laterKill.push(obj)
    }

    update(){
        if (this.player === null)
            return
        this.player.move_x = 0
        this.player.move_y = 0
        if (eventsManager.action["up"] && !this.player.isAttacking && !this.player.isDying) this.player.move_y = -1
        if (eventsManager.action["down"] && !this.player.isAttacking && !this.player.isDying) this.player.move_y = 1
        if (eventsManager.action["left"] && !this.player.isAttacking && !this.player.isDying) this.player.move_x = -1
        if (eventsManager.action["right"] && !this.player.isAttacking && !this.player.isDying) this.player.move_x = 1
        if (eventsManager.action["attack"] && !this.player.isAttacking && !this.player.isDying) this.player.attack()

        this.entities.forEach(function (e) {
            try {
                e.update()
            } catch (ex) {
                console.log(ex)
            }
        })

        for (const objectBeingKilled of this.laterKill){
            const idx = this.entities.indexOf(objectBeingKilled)
            if (idx > -1)
                this.entities.splice(idx, 1)
        }

        if (this.laterKill.length > 0)
            this.laterKill.length = 0

        mapManager.centerAt(this.player.pos_x, this.player.pos_y)
        mapManager.draw(ctx)
        this.draw(ctx)
        this.updatePanel()
    }

    updatePanel(){
        const level = document.getElementById('level')
        level.innerText = this.level.toString()

        const hp = document.getElementById('hp')
        hp.innerText = this.player.health.toString() + " / 3"

        const gold = document.getElementById('gold')
        gold.innerText = this.player.gold.toString()
    }

    draw(){
        for (const entity of this.entities){
            try {
                entity.draw()
            } catch (e) {
                console.log(e)
            }
        }
    }

    continue(){
        this.closeRecords()
        this.level = 2
        mapManager.loadMap(`map${this.level}.json`)
        mapManager.parseEntities()
        this.play()
    }

    retry(){
        this.closeRecords()
        mapManager.parseEntities()
        this.play()
    }


    loadAll(){
        mapManager.loadMap(`map${this.level}.json`)
        spriteManager.loadAtlas('atlas.json', 'atlas.png')

        this.factory["Player"] = Player
        this.factory["Fire"] = Fire
        this.factory["Gold"] = Gold
        this.factory["Darkness"] = Darkness
        this.factory["GoldKey"] = GoldKey
        this.factory["SilverKey"] = SilverKey
        this.factory["Door"] = Door
        this.factory["SpeedPotion"] = SpeedPotion
        this.factory["HealthPotion"] = HealthPotion
        this.factory["Slime"] = Slime
        this.factory["Orc"] = Orc
        this.factory["Finish"] = Finish

        mapManager.parseEntities()
        eventsManager.setup()
    }
    play(){
        this.gameIsOn = true
        this.timer = setInterval(() => {
            try {this.update()}
            catch (e) {
                console.log(e)
            }
        }, 50)
    }

    passLevel(){
        clearInterval(this.timer)
        soundManager.play("victory", {volume: 0.5})
        this.gameIsOn = false
        this.addRecord()
        this.updatePanel()
        this.hint.innerText = this.level === 1 ? "Continue?" : "Retry?"
        this.level_passed = true
        this.openRecords()
        this.laterKill.length = 0
        this.entities.length = 0
    }

    failLevel(){
        clearInterval(this.timer)
        soundManager.play("defeat")
        this.gameIsOn = false
        this.updatePanel()
        this.hint.innerText = "Retry?"
        this.level_passed = false
        this.openRecords()
        this.laterKill.length = 0
        this.entities.length = 0
    }


    openRecords() {
        if (this.recordsAreOpen())
            return
        const records = JSON.parse(localStorage.getItem(`level${this.level}`))
        if (!records)
            return this.modal.classList.add("open")
        let i = 1
        const sorted_entries = Object.entries(records).sort((a, b) => b[1] - a[1])
        const sorted_records = Object.fromEntries(sorted_entries);
        for (const player in sorted_records){
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            td1.innerText = (i++).toString()
            td2.innerText = player
            td3.innerText = sorted_records[player].toString()
            tr.appendChild(td1)
            tr.appendChild(td2)
            tr.appendChild(td3)
            this.tableRecords.appendChild(tr)
            if (i === 10)
                break
        }

        this.modal.classList.add("open")
    }

    closeRecords() {
        this.modal.classList.remove("open")
        this.tableRecords.innerHTML = ""
    }

    recordsAreOpen() {
        return this.modal.classList.contains("open")
    }

    addRecord() {
        const score = this.player.gold
        const recordsJSON = localStorage.getItem(`level${this.level}`)
        let records = {};
        if (recordsJSON)
            records = JSON.parse(recordsJSON)
        let player = this.nickname.value
        if (!player)
            player = "Nickname"
        if (!records[player] || records[player] < score){
            records[player] = score
            localStorage.setItem(`level${this.level}`, JSON.stringify(records))
        }
    }
}

