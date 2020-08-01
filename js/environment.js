class Environment {
    constructor() {
        this.ratingMatrix = new RatingMatrix(width, height, 14)
        this.spawnPos = createVector(this.ratingMatrix.blockWidth * 1.5, this.ratingMatrix.blockHeight * 1.5)
        this.targets = []
        this.addTargets()
        this.boxes = initBoxes(width, height, this.ratingMatrix.blockWidth, this.ratingMatrix.blockHeight)
        this.agent;
        this.i = 0
        this.e = 0
    }

    getProperties() {
        return { bW: this.ratingMatrix.blockWidth, bH: this.ratingMatrix.blockHeight }
    }

    run() {
        text(this.i, width / 2, height / 2)
        this.i++
        this.updateAgent()
    }

    addTargets() {
        this.targets.push({ m: 20, n: 11 })
    }

    draw() {
        background(255)
        drawMatrix(...this.ratingMatrix.getDrawParams())
        drawTargets(this.targets, this.ratingMatrix.blockWidth, this.ratingMatrix.blockHeight)
        drawBoxes(this.boxes)
        this.agent.draw()
    }

    updateAgent() {
        const oldPos = this.agent.pos.copy()
        const action = this.agent.update(this.ratingMatrix, this.targets)



        let collision = this.boxes.some(box => this.agent.pos.x < box.pos.x + box.size.x &&
            this.agent.pos.x + this.agent.size > box.pos.x &&
            this.agent.pos.y < box.pos.y + box.size.y &&
            this.agent.pos.y + this.agent.size > box.pos.y)

        if (collision) {
            this.agent.pos = oldPos
        }

        // found target ? 
        const cords = this.ratingMatrix.getCordsForPos(this.agent.pos)
        const foundTarget = this.targets.some(t => t.n === cords.n && t.m === cords.m)

        let reward = foundTarget ? 10 : -0.1
        reward = collision ? -10 : reward

        const oldValue = this.ratingMatrix.getMatrixAtPos(oldPos, this.targets)[action]
        const next_max = this.ratingMatrix.getHighestRewardAtPos(this.agent.pos, this.targets)

        const gamma = 0.85
        const lr = 0.99
        const newValue = (1 - gamma) * oldValue + lr * (reward + gamma * next_max)
        //const newValue = oldValue + lr * (reward + gamma * next_max) - oldValue

        this.ratingMatrix.setRewardAtPos(oldPos, action, newValue, this.targets)
        this.targets = this.targets.filter(t => !(t.n === cords.n && t.m === cords.m))
    }

    stringifyTargets() {
        let s = ''
        for (let t of this.targets) {
            s += `${t.x},${t.y}`
        }
        return s
    }

    reset() {
        this.spawnAgent()
        this.addTargets()
        this.i = 0
    }

    spawnAgent() {
        this.agent = new Agent(createVector(this.spawnPos.x, this.spawnPos.y), { x: this.ratingMatrix.blockWidth, y: this.ratingMatrix.blockHeight })
    }

    running() {
        return !this.done()
    }

    done() {
        return this.targets.length === 0
    }
}
