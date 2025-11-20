const PongGame = require('./PongGame');
const client = require('prom-client');

const activeGamesGauge = new client.Gauge({
    name: 'pong_active_games',
    help: 'Number of active Pong games'
});
const gamesStartedCounter = new client.Counter({
    name: 'pong_games_started_total',
    help: 'Total number of Pong games started'
});

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
            if (index === 1) {
                game.start();
                gamesStartedCounter.inc();
            }
            return index;
        }
        else {
            const game = new PongGame(this.db);
            const index = game.players.length;
            this.games.set(gameId, game);
            game.players.push(connection);
            game.playersNames.push(name);
            game.playersId.push(playerId);
            if (picture)
                game.playerPictures.push(picture);
            else
                game.playerPictures.push('');
            activeGamesGauge.set(this.games.size);
            console.log('[metrics] pong_active_games set to', this.games.size);
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
            activeGamesGauge.set(this.games.size);
            console.log('[metrics] pong_active_games set to', this.games.size);
            return;
        }
        if (index === 0) {
            game.players[1].send(JSON.stringify({type: 'disconnect', left: game.playersNames[0]}));
            this.games.delete(id);
            activeGamesGauge.set(this.games.size);
            console.log('[metrics] pong_active_games set to', this.games.size);
        }
        else {
            game.players[0].send(JSON.stringify({type: 'disconnect', left: game.playersNames[1]}));
            this.games.delete(id);
            activeGamesGauge.set(this.games.size);
            console.log('[metrics] pong_active_games set to', this.games.size);
        }
    }
}

module.exports = GameManager;