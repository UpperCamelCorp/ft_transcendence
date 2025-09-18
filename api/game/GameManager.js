const PongGame = require('./PongGame');

class GameManager {
    
    constructor() {
        this.games = new Map();
    }

    joinGame(id, connection, name) {
        if (this.games.has(id)) {
            const game = this.games.get(id);
            const index = game.players.length;
            console.log('game len = ', index);
            if (index >= 2)
                return -1;
            game.players.push(connection);
            game.playersNames.push(name);
            if (index === 1)
                game.start();
            return index;
        }
        else {
            const game = new PongGame();
            const index = game.players.length;
            this.games.set(id, game);
            game.players.push(connection);
            game.playersNames.push(name);
            return index;
        }
    }

    disconnect(id, index) {
        const game = this.games.get(id);
        if (!game)
            return;
        game.stop();
        if (index === 0) {
            game.players[1].send(JSON.stringify({type: 'disconnect', left: game.playersNames[0]}));
            this.games.delete(id);
        }
        else {
            game.players[0].send(JSON.stringify({type: 'disconnect', left: game.playersNames[1]}));
            this.games.delete(id);
        }

    }
}

module.exports = GameManager;