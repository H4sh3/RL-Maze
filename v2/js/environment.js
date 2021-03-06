class Environment {
    constructor(res, keyPosition) {
        this.res = res
        this.qTable = new QTable(this.res)
        this.spawnPos = { m: 2, n: 2 }
        this.target;
        this.agent;
        this.i;
        this.e;
        this.targetFound = false
        this.showAllQValues = false
        this.door = this.initDoor()

        this.keyPosition = keyPosition


        this.key = this.initKey()

        this.maze = initMaze(this.res)
        this.maze = addBorders(this.maze)
    }



    initKey() {
        return {
            pos: this.keyPosition,
            collected: false
        }
    }

    initDoor() {
        return {
            pos: {
                m: 17,
                n: 17
            },
            open: false
        }
    }

    run() {
        const action = random() < 0.1 && this.agent.explore ? random([0, 1, 2, 3]) : this.qTable.getBestAction(this.agent.pos.m, this.agent.pos.n, this.key.collected)

        const oldPos = { m: this.agent.pos.m, n: this.agent.pos.n }
        this.agent.update(action)

        let collision = this.checkCollision(this.maze, this.agent)
        if (collision) {
            this.agent.pos = oldPos
        }


        const oldValue = this.qTable.getMatrixAtPos(oldPos.m, oldPos.n, this.key.collected)[action]

        // found target ? 
        this.targetFound = this.target.m === this.agent.pos.m && this.target.n === this.agent.pos.n

        let foundKey = false
        let oldKeyValue = this.key.collected
        if (this.agent.pos.m === this.key.pos.m && this.agent.pos.n === this.key.pos.n && !this.key.collected) {
            this.key.collected = true
            foundKey = true
        }

        if (this.agent.pos.m === this.door.pos.m - 1 && this.agent.pos.n === this.door.pos.n && !this.door.open && this.key.collected) {
            this.door.open = true
        }

        let reward = this.targetFound || foundKey ? 10 : -0.1
        reward = collision ? -1 : reward

        const next_max = this.qTable.getHighestRewardAtPos(this.agent.pos.m, this.agent.pos.n, this.key.collected)

        const gamma = 0.85
        const lr = 0.99
        const newValue = (1 - gamma) * oldValue + lr * (reward + gamma * next_max)

        this.qTable.setRewardAtPos(oldPos.m, oldPos.n, action, newValue, oldKeyValue)
        this.i++
    }

    draw() {
        background(255)
        drawMatrix(...this.qTable.getDrawParams(), this.showAllQValues, this.key.collected)
        drawMaze(this.maze, this.qTable.blockWidth, this.qTable.blockHeight)
        drawAgent(this.agent.pos, this.qTable.blockWidth, this.qTable.blockHeight)
        drawTarget(this.target, this.qTable.blockWidth, this.qTable.blockHeight)

        if (!this.door.open) {
            drawDoor(this.door.pos, this.qTable.blockWidth, this.qTable.blockHeight)
        }
        if (!this.key.collected) {
            drawKey(this.key.pos, this.qTable.blockWidth, this.qTable.blockHeight)
        }
    }

    init() {
        this.reset()
        this.e = 0
        this.qTable = new QTable(this.res)
    }

    reset() {
        this.spawnAgent()
        this.targetFound = false
        this.door = this.initDoor()
        this.key = this.initKey()
        this.i = 0
    }

    spawnAgent() {
        this.agent = new Agent()
    }

    running() {
        return !this.done();
    }

    done() {
        return this.targetFound
    }

    getProperties() {
        return { bW: this.qTable.blockWidth, bH: this.qTable.blockHeight }
    }

    checkCollision(maze, agent) {
        const outOfMap = agent.pos.m < 0 ||
            agent.pos.m >= this.qTable.res ||
            agent.pos.n < 0 ||
            agent.pos.n >= this.qTable.res

        return outOfMap || maze[agent.pos.m][agent.pos.n] || this.checkDoor()
    }

    checkDoor() {
        if (this.door.open) {
            return false
        } else {
            return (this.door.pos.m === this.agent.pos.m && this.door.pos.n === this.agent.pos.n)
        }
    }
}
