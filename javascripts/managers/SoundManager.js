class SoundManager{
    clips = {}
    context = null
    gainNode = null
    loaded = false
    isOn = false


    load(name, callback){
        if (this.clips[name]){
            callback(this.clips[name])
            return
        }
        const clip = {buffer: null, loaded: false}
        clip.play = (volume, loop) => this.play(name, {looping: loop ? loop : false, volume: volume ? volume : 1})
        this.clips[name] = clip
        const request = new XMLHttpRequest()
        request.open('GET', `sounds/${name}.mp3`, true)
        request.responseType = 'arraybuffer'
        request.onload = () => {
            this.context.decodeAudioData(request.response, (buffer) => {
                clip.buffer = buffer
                clip.loaded = true
                callback(clip)
            })
        }
        request.send()
    }

    loadAll(){
        this.context = new AudioContext()
        this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode()
        this.gainNode.connect(this.context.destination)
        const array = ['slime_fire', 'fireball', 'fire_strike', 'player_attack_hit', 'player_attack_miss', 'gold', 'key',
            'door_open', 'player_pain', 'defeat', 'victory', 'darkness', 'potion']
        for (const name of array){
            this.load(name, () => {
                if (array.length === Object.keys(this.clips).length){
                    for (const sd in this.clips)
                        if (!this.clips[sd].loaded) return
                    this.loaded = true
                }
            })
        }
    }

    play(name, settings){
        if (!this.loaded || !this.isOn) {
            //setTimeout(() => this.play(name, settings), 1000)
            return
        }
        let looping = false
        let volume = 1
        if (settings){
            if (settings.looping)
                looping = settings.looping
            if (settings.volume)
                volume = settings.volume
        }
        const sd = this.clips[name]
        if (sd === null)
            return false

        const sound = this.context.createBufferSource()
        sound.buffer = sd.buffer
        sound.connect(this.gainNode)
        sound.loop = looping
        this.gainNode.gain.value = volume
        sound.start(0)
        return true
    }

    playWorldSound(name, x, y){
        if (gameManager.player === null)
            return

        const viewSize = Math.max(mapManager.view.w, mapManager.view.h) * 0.8
        const dx = Math.abs(gameManager.player.pos_x - x)
        const dy = Math.abs(gameManager.player.pos_y - y)
        const distance = Math.sqrt(dx ** 2 + dy ** 2)
        let norm = distance / viewSize
        if (norm > 1)
            norm = 1
        const volume = 1.0 - norm
        if (!volume)
            return;
        this.play(name, {looping: false, volume})
    }


    stopAll(){
        this.gainNode.disconnect()
        this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode()
        this.gainNode.connect(this.context.destination)
    }
}