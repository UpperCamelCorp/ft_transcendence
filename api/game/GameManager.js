const PongGame = require('./PongGame');

class GameManager {
    
    constructor(db) {
        this.db = db;
        this.games = new Map();
    }

    joinGame(gameId, connection, playerId, name, picture) {
        if (this.games.has(gameId)) {
            const game = this.games.get(gameId);
            const index = game.players.length;
            if (index >= 2)
                return -1;
            game.players.push(connection);
            game.playersNames.push(name);
            game.playersId.push(playerId);
            if (picture)
                game.playerPictures.push(picture);
            else
                game.playerPictures.push('');
            if (index === 1)
                game.start();
            return index;
        }
        else {
            const game = new PongGame(this.db);
            const index = game.players.length;
            this.games.set(id, game);
            game.players.push(connection);
            game.playersNames.push(name);
            if (picture)
                game.playerPictures.push(picture);
            else
                game.playerPictures.push('');
            return index;
        }
    }

    disconnect(id, index) {
        const game = this.games.get(id);
        if (!game)
            return;
        game.stop();
        if (game.players.length < 2) {
            this.games.delete(id);
            return;
        }
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