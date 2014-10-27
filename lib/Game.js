'use strict';

var gameSequence = 1;

function Game(uiConnection) {
    this.uiConnection = uiConnection;
    this.id = 'GAME!' + gameSequence ++;
    this.playerCount = 0;
    this.players = {};
    this.playerActive = 0;
    this.board = [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
    ];



    //     00,     01,     02,     03

    // 10,     11,     12,     13

    //     20,     21,     22,     23

    // 30,     31,     32,     33

    //     40,     41,     42,     43

    // 50,     51,     52,     53

    //     60,     61,     62,     63

    // 70,     71,     72,     73



    // 10, 11 => ok

    // 19, 21 => ok se passou por cima





    this.play = function (player, move) {
        var playerIdx = player.getNumber();

        var x1 = Math.floor(move[0] / 10);
        var y1 = move[0] % 10;

        var x2 = Math.floor(move[1] / 10);
        var y2 = move[1] % 10;

        //console.log(x1, y1, x2, y2);
        //console.log(this.board[x2][y2]);
        if (this.board[x2][y2] != 0) {
            console.log('SLOT IS OCCUPIED');
            return false;
        }

        var pivot1 = x1 * 10 + y1;
        var pivot2 = x2 * 10 + y2;
        if (player === 2) {
            pivot1 = abs(pivot1 - 70);
            pivot2 = abs(pivot2 - 70);
        }

        if ((playerIdx === 1 && pivot2 - pivot1 < 0) || (playerIdx === 2 && pivot2 - pivot1 > 0)) {
            console.log('INVALID PLAY - PLAYING BACKWARDS');
            return false;
        }

        if (Math.abs(pivot1 - pivot2) !== 10 && Math.abs(pivot1 - pivot2) !== 11) {
            //if (Math.abs(pivot1 - pivot2) === 19) {
            console.log('INVALID PLAY - 1 SLOT PER TURN DIAGONAL PLEASE.');
            return false;
            //}
        }

        console.log(playerIdx, pivot1, pivot2);


        if (Math.abs(pivot1 - pivot2) !== 19 && Math.abs(pivot1 - pivot2) !== 21) {

        }

        this.board[x1][y1] = 0;
        this.board[x2][y2] = playerIdx;


        this.turn();
        return true;
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