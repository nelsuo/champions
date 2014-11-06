/*jslint node: true */
'use strict';

var CheckersTurn = require('./CheckersTurn');

var gameSequence = 1;

function Game(uiConnection) {
    this.uiConnection = uiConnection;
    this.id = 'GAME!' + gameSequence ++;
    this.playerCount = 0;
    this.players = {};
    this.playerActive = 0;

    this.board = [
        [11, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [0, 22, 0, 0],
        [0, 0, 0, 0],
        [2, 2, 2, 11],
        [2, 2, 0, 0],
        [2, 2, 2, 22],
    ];



    // 0         00,       01,       02,       03     10 11

    // 1    10,       11,       12,       13          9  10 n%2

    // 0         20,       21,       22,       23

    // 1    30,       31,       32,       33

    // 0         40,       41,       42,       43

    // 1    50,       51,       52,       53

    // 0         60,       61,       62,       63

    // 1    70,       71,       72,       73

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
            return false;
        }





        turn.finish();

        console.log(turn.matrix);

        if (this.playerActive === 2) {
            this.board = this.invert(turn.matrix);
        } else {
            this.board = turn.matrix;
        }

        this.turn();
        return true;
    };

    this.checkJumpable = function (playerIdx, antiPlayerIdx, matrix, i, j) {
        var mod, pivot1, pivot2, pivot3, pivot4;

        mod = (i + 1) % 2;
        pivot1 = i * 10 + j;
        pivot2 = pivot1 + mod + 9;
        pivot3 = pivot1 + mod + 10;

        if (matrix[Math.floor(pivot2/10)] !== undefined &&
            matrix[Math.floor(pivot2/10)][pivot2%10] === antiPlayerIdx) {

            pivot4 = pivot1 + 19;

            if (matrix[Math.floor(pivot4/10)] !== undefined &&
                matrix[Math.floor(pivot4/10)][pivot4%10] === 0
                ) {
                return true;
            }

        }

        if (matrix[Math.floor(pivot3/10)] !== undefined &&
            matrix[Math.floor(pivot3/10)][pivot3%10] === antiPlayerIdx) {

            pivot4 = pivot1 + 21;

            if (matrix[Math.floor(pivot4/10)] !== undefined &&
                matrix[Math.floor(pivot4/10)][pivot4%10] === 0
                ) {
                return true;
            }
        }
        return false;
    };

    this.getId = function () {
        return this.id;
    };

    this.message = function (action, payload) {
        switch(action) {
            case 'get-board-state':
                this.sendBoardState();
            break;
        }
    };

    this.sendBoardState = function () {
        this.send('board-state', { board: this.board});
    };

    this.addPlayer = function (player) {
        player.setGame(this);
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

    this.send = function (action, data) {
        this.uiConnection.send(action, data);
    };
}

module.exports = Game;