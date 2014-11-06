/*jslint node: true */
'use strict';

var Game = require('./Game');
var Player = require('./Player');
var ws = require('ws'); 
var games = [];

var connectionSequence = 1;

function init() {
    var server = new ws.Server({port: 9002});
    server.on('connection', function(ws) {
        new Connection(ws);
    });
}

function _createGame(connection) {
    var game = new Game(connection);
    games[game.getId()] = game;
    return game;
}

function _addPlayerToGame(gameId, connection) {
    var game = games[gameId];
    if (game.getPlayerCount() == 2) {
        return false;
    }
    var player = new Player(connection);
    game.addPlayer(player);
    return player;
}


function Connection (ws) {
    this.ws = ws;
    this.id = 'CONNECTION!' + connectionSequence++;
    this.instance = null;
    console.log('..............................................');
    this.ws.on('message', function(message) {
        
        var payload = JSON.parse(message);
        var action = payload.action;
        var data = payload.data;

        switch(payload.action) {
            case 'create-game':
                this.instance = _createGame(this);
                this.send('game-created', { gameId: this.instance.getId() });
            break;
            case 'join-game':
                
                if (this.instance !== null) {
                    this.sendError('Must be a new connection');
                    return;
                }

                if (!data.gameId) {
                    this.sendError('gameId must be set');
                    return;
                }
                
                if (games[data.gameId] === undefined) {
                    this.sendError('game does not exist');
                    return;
                }

                this.instance = _addPlayerToGame(data.gameId, this);
                if (this.instance) {
                    this.send('player_accepted', { playerId: this.instance.getId() });
                } else {
                    this.sendError('player not accepted');
                }
                
            break;
            default:
                if (this.instance === null) {
                    this.sendError('Instance must be defined');
                }
                this.instance.message(action, data);
            break;
        }
    }.bind(this));

    this.send = function (action, data) {
        this.ws.send(JSON.stringify({
            ok: true,
            action: action,
            data: data
        }));
    };

    this.sendError = function (message) {
        this.ws.send(JSON.stringify({
            ok: false,
            error: message
        }));
    };
}

module.exports = {
    init: init
};