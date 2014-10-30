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



    // 0         00,     01,     02,     03     10 11

    // 1    10,     11,     12,     13          9  10 n%2

    // 0         20,     21,     22,     23     

    // 1    30,     31,     32,     33          

    // 0         40,     41,     42,     43     

    // 1    50,     51,     52,     53          

    // 0          60,     61,     62,     63    

    // 1    70,     71,     72,     73          



    // 10, 11 => ok

    // 19, 21 => ok se passou por cima



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
        var playerIdx = player.getNumber(), matrix, antiPlayerIdx = (!(playerIdx - 1)) * 1 + 1, jumped = false;
        console.log('Player: ', playerIdx);

        if (playerIdx === 2) {
            matrix = this.invert(this.board);
        } else {
            matrix = this.board;
        }

        console.log(matrix);

        var x1 = Math.floor(move[0] / 10);
        var y1 = move[0] % 10;

        var x2 = Math.floor(move[1] / 10);
        var y2 = move[1] % 10;

        console.log(x1, y1, x2, y2);
        //console.log(this.board[x2][y2]);
        if (matrix[x2][y2] != 0) {
            console.log('SLOT IS OCCUPIED');
            return false;
        }

        var pivot1 = x1 * 10 + y1;
        var pivot2 = x2 * 10 + y2;
        

        if (pivot2 - pivot1 < 0) {
            console.log('INVALID PLAY - PLAYING BACKWARDS');
            return false;
        }
        var mod = (x1+1)%2;

        if (pivot2 - pivot1 !== 9 + mod && pivot2 - pivot1 !== 10 + mod && pivot2 - pivot1 !== 19 && pivot2 - pivot1 !== 21) {
            //if (Math.abs(pivot1 - pivot2) === 19) {
            console.log('INVALID PLAY - 1 SLOT PER TURN DIAGONAL PLEASE.');
            return false;
            //}
        }

        console.log(playerIdx, pivot1, pivot2);


        if (pivot2 - pivot1 === 19) {
            var pivot3 = pivot1 + 9 + mod;
            console.log(pivot3);
            console.log('PIVOT3: ', Math.floor(pivot3/10), pivot3%10, matrix[Math.floor(pivot3/10)][pivot3%10], antiPlayerIdx);
            if (matrix[Math.floor(pivot3/10)][pivot3%10] !== antiPlayerIdx) {
                console.log('INVALID PLAY - 2 SLOT ONLY WHEN JUMPING OPONENT.');
                return false;
            }
            matrix[Math.floor(pivot3/10)][pivot3%10] = 0;
            jumped = true;
        }
        if (pivot2 - pivot1 === 21) {
            var pivot3 = pivot1 + 10 + mod;
            console.log(pivot3);
            console.log('PIVOT3: ', Math.floor(pivot3/10), pivot3%10, matrix[Math.floor(pivot3/10)][pivot3%10], antiPlayerIdx);
            if (matrix[Math.floor(pivot3/10)][pivot3%10] !== antiPlayerIdx) {
                console.log('INVALID PLAY - 2 SLOT ONLY WHEN JUMPING OPONENT.');
                return false;
            }
            matrix[Math.floor(pivot3/10)][pivot3%10] = 0;
            jumped = true;
        }

        matrix[x1][y1] = 0;
        matrix[x2][y2] = playerIdx;

        console.log(matrix);

        if (this.playerActive === 2) {
            this.board = this.invert(matrix);
        } else {
            this.board = matrix;
        }
        if (!jumped) {
            this.turn();
        } else {
            this.keepTurn(playerIdx - 1);
        }
        
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

    this.keepTurn = function (playerIdx) {
        this.sendBoardState();

        var keys = Object.keys(this.players);
        this.players[keys[!playerIdx * 1]].sleep();
        this.players[keys[playerIdx]].wake();
    };

    this.getPlayerCount = function () {
        return this.playerCount;
    };

    this.send = function (action, data) {
        this.uiConnection.send(action, data);
    };
}

module.exports = Game;