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
        [0, 2, 0, 0],
        [0, 0, 0, 0],
        [2, 2, 2, 0],
        [2, 2, 0, 0],
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
        if (move.length === 0) {
            console.log('EMPTY MOVE, PLEASE ELABORATE!');
            return false;
        }
        var playerIdx = player.getNumber(), 
            matrix, 
            antiPlayerIdx = (!(playerIdx - 1)) * 1 + 1, 
            jumped = [],
            validDeltas = [9, 10, 19, 21],
            validJumps = [19, 21],
            initialX, initialY, pivot1, pivot2, pivot3, i, x1, y1, x2, y2, delta;

        console.log('Player: ', playerIdx);

        if (playerIdx === 2) {
            matrix = this.invert(this.board);
        } else {
            matrix = this.board;
        }
        console.log(matrix);
        for (i = 0; i < move.length-1; i++) {

            pivot1 = move[i];
            pivot2 = move[i + 1];
            x1 = Math.floor(move[i] / 10);
            y1 = move[i] % 10;
            x2 = Math.floor(move[i + 1] / 10);
            y2 = move[i + 1] % 10;
            
            if (i === 0) {
                initialX = x1;
                initialY = y1;
                if (matrix[x1][y1] !== playerIdx) {
                    console.log('INITIAL SLOT DOESN\' BELONG TO PLAYER ... YOU CHEATER');
                    return false;
                }
            }

            console.log(x1, y1, x2, y2);

            if (matrix[x2][y2] !== 0) {
                console.log('SLOT IS OCCUPIED');
                return false;
            }

            if (pivot2 - pivot1 < 0) {
                console.log('INVALID PLAY - PLAYING BACKWARDS');
                return false;
            }

            delta = pivot2 - pivot1;
            if (validDeltas.indexOf(delta) === -1) {
                console.log('INVALID PLAY - 1 SLOT PER TURN DIAGONAL PLEASE.');
                return false;
            }

            if (validJumps.indexOf(delta) !== -1) {
                var base;
                var mod = (x1+1)%2;
                if (delta === 19) {
                    base = 9;
                } else if(delta === 21) {
                    base = 10;
                }
                pivot3 = pivot1 + base + mod;
                if (matrix[Math.floor(pivot3/10)][pivot3%10] !== antiPlayerIdx) {
                    console.log('INVALID PLAY - YOU SHOULD BE JUMPING ON A PIECE.', Math.floor(pivot3/10), pivot3%10);
                    return false;
                }
                jumped.push(pivot3);
            }
        }
        console.log(jumped);
        // remove the jumped pieces
        jumped.forEach(function (jump) {
            console.log(jump);
            matrix[Math.floor(jump/10)][jump%10] = 0;
        });

        // clear the initial position
        matrix[initialX][initialY] = 0;
        matrix[x2][y2] = playerIdx;

        // show the final matrix
        console.log(matrix);

        if (this.playerActive === 2) {
            this.board = this.invert(matrix);
        } else {
            this.board = matrix;
        }

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