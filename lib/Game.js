/*jslint node: true */
'use strict';

var CheckersTurn = require('./CheckersTurn');

var gameSequence = 1;

function Game(connection) {
    this.connection = connection;
    this.uiConnections = [];
    this.id = 'GAME!' + gameSequence ++;
    this.playerCount = 0;
    this.players = {};
    this.playerActive = 0;

    this.board = [
        [0, 11, 0, 0],
        [0, 2, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];



// expand the board otherwise it will be impossible to do calculate the trajectories over it.

    // 0                 00,       01,       02,       03

    // 1            10,       11,       12,       13

    // 0                 20,       21,       22,       23

    // 1            30,       31,       32,       33

    // 0                 40,       41,       42,       43

    // 1            50,       51,       52,       53

    // 0                 60,       61,       62,       63

    // 1            70,       71,       72,       73

// 30 - 61
// 00 - 32
    
    this.addUi = function (uiConnection) {
        this.uiConnections.push(uiConnection);
    };

    this.invert = function (arr) {
        var inverse = [], k = 0;

        for (var i = 7 ; i >= 0 ; i --) {
            inverse[k] = [];
            for (var j = 3 ; j >= 0 ; j --) {
                inverse[k].push(arr[i][j]);
            }
            k++;
        }
        return inverse;
    };

    this.play = function (player, move) {
        var playerIdx = player.getNumber(),
            matrix = playerIdx === 1 ? JSON.parse(JSON.stringify(this.board)) : this.invert(this.board);

        var turn = new CheckersTurn(matrix, player.getNumber(), move);
        turn.evaluate();
        if (turn.getErrors().length) {
            return { ok: false, errors: turn.getErrors() };
        }

        turn.finish();

        if (this.playerActive === 2) {
            this.board = this.invert(turn.matrix);
        } else {
            this.board = turn.matrix;
        }
        if (turn.winner) {
            var keys = Object.keys(this.players);
            this.players[keys[this.playerActive == 1 ? 0 : 1]].notifyWin();
            this.players[keys[this.playerActive == 1 ? 1 : 0]].notifyLost();
        }

        this.turn();
        return { ok: true };
    };

   

    this.getId = function () {
        return this.id;
    };

    this.message = function (action, payload) {
        switch(action) {
            
        }
    };

    this.getBoard = function () {
        return this.board;
    };

    this.addPlayer = function (player) {
        player.setNumber(this.playerCount + 1);
        this.players[player.getId()] = player;
        this.playerCount ++;
        if (this.playerCount === 2) {
            this.turn();
        }
    };

    this.turn = function () {
        if (this.playerActive > 1) {
            this.playerActive = 0;
        }
        this.sendBoardState();

        var keys = Object.keys(this.players);
        this.players[keys[!this.playerActive * 1]].sleep();
        this.players[keys[this.playerActive]].wake();
        this.playerActive ++;
    };

    this.getPlayerCount = function () {
        return this.playerCount;
    };

    this.sendBoardState = function () {
        this.uiConnections.forEach(function (ui) {
            ui.sendBoardState();
        });
    };
}

module.exports = Game;