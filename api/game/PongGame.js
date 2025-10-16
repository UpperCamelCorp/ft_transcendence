class PongGame {

    constructor(db) {
        this.db = db
        this.players = [];
        this.playersId = [];
        this.inputs = [{up: false, down: false}, {up: false, down: false}];
        this.playersNames = [];
        this.playerPictures = [];
        this.loopId = 0;
        this.scores = [0, 0];
        this.bally = 504 / 2;
        this.lefty = this.bally;
        this.righty = this.bally;
        this.ballx = 896 / 2;
        this.leftx = 80;
        this.rightx = 896 - 80;
        this.balldx = 5;
        this.balldy = 5;
        this.speed = 5;
    }

    broadcast(data) {
        this.players.forEach(player => {
            player.send(JSON.stringify(data));
        })
    }

    resetBall() {
        this.ballx = 896 / 2;
        this.bally = 504 / 2;
    }

    update() {
        this.ballx += this.balldx;
        this.bally += this.balldy;

        if (this.bally >= 504 || this.bally <= 0)
            this.balldy = -this.balldy;

        else if ((this.ballx <= this.leftx + 10 && this.ballx >= this.leftx - 10) 
            && (this.bally <= this.lefty + 40 && this.bally >= this.lefty - 40))
            this.balldx = -this.balldx;
        else if ((this.ballx <= this.rightx + 10 && this.ballx >= this.rightx - 10) 
            && (this.bally <= this.righty + 40 && this.bally >= this.righty - 40))
            this.balldx = -this.balldx;
        else if (this.ballx <= 0) {
            this.scores[1]++;
            this.resetBall();
        }
        else if (this.ballx >= 896) {
            this.scores[0]++;
            this.resetBall();
        }
        if (this.inputs[0].up && this.lefty > 0) this.lefty -= this.speed;
        if (this.inputs[0].down && this.lefty < 504) this.lefty += this.speed;
        if (this.inputs[1].up && this.righty > 0) this.righty -= this.speed;
        if (this.inputs[1].down && this.righty < 504) this.righty += this.speed;
    }
    loop() {
        this.loopId= setInterval(() => {
            this.update();
            this.broadcast({
                type: 'update',
                ballx: this.ballx,
                bally: this.bally,
                leftx: this.leftx,
                lefty: this.lefty,
                rightx: this.rightx,
                righty: this.righty,
                scores: this.scores
            });
            if (this.scores[0] === 3) {
                this.broadcast({
                    type: 'gameover',
                    winner: this.playersNames[0]
                });
                this.saveGame(this.playersId[0]);
                this.stop();
            }
            else if (this.scores[1] === 3){
                this.broadcast({
                    type: 'gameover',
                    winner: this.playersNames[1]
                });
                this.saveGame(this.playersId[1]);
                this.stop();
            }
        }, 1000/60);
    }

    start() {
        this.broadcast({
            type: 'start',
            player1: this.playersNames[0],
            player2: this.playersNames[1],
            player1Picture: this.playerPictures[0],
            player2Picture: this.playerPictures[1]
        });
        this.loop();
    }

    saveGame(winner) {
        const score = `${this.scores[0]} : ${this.scores[1]}}`;
        this.db.run('INSERT INTO game (player1_id, player2_id, winner, score) VALUES (?, ?, ?, ?)', [this.playersId[0], this.playersId[1], winner, score], (e) => {
            if (e)
                console.log('Cannot save the game : ', e);
        });
    }

    stop() {
        if (this.loopId) {
            clearInterval(this.loopId);
            this.loopId = null;
        }
    }
}

module.exports = PongGame;