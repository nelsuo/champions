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
            initialX, initialY, pivot1, pivot2, pivot3, i, j, x1, y1, x2, y2, delta, mod;

        console.log('Player: ', playerIdx);

        if (playerIdx === 2) {
            matrix = this.invert(this.board);
        } else {
            matrix = JSON.parse(JSON.stringify(this.board));
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

            mod = (x1+1)%2;
            delta = pivot2 - pivot1;
            console.log(mod);
            console.log(delta);
            

            if (validDeltas.indexOf(delta - mod) === -1 && validJumps.indexOf(delta) === -1) {
                console.log('INVALID PLAY - 1 SLOT PER TURN DIAGONAL PLEASE.');
                return false;
            }

            if (validJumps.indexOf(delta) !== -1) {
                var base;
                
                if (delta === 19) {
                    base = 9;
                } else if(delta === 21) {
                    base = 10;
                }
                pivot3 = pivot1 + base + mod;
                if (matrix[Math.floor(pivot3/10)][pivot3%10] !== antiPlayerIdx) {
                    console.log('INVALID PLAY - YOU SHOULD BE JUMPING ON A PIECE.', Math.floor(pivot3/10), pivot3%10, matrix[Math.floor(pivot3/10)][pivot3%10]);
                    return false;
                }
                jumped.push(pivot3);
            } else if (move[i + 2] !== undefined) {
                console.log('ONLY WHEN JUNPING THERE CAN BE ANOTHER PLAY');
                return false;
            }
        }
        
        // remove the jumped pieces
        jumped.forEach(function (jump) {
            console.log(jump);
            matrix[Math.floor(jump/10)][jump%10] = 0;
        });

        if (jumped.length === 0) {
            console.log('check if there is something to eat');
            for (i = 0 ; i < 8 ; i ++) {
                for (j = 0 ; j < 4 ; j ++) {
                    if (matrix[i][j] === playerIdx) {
                        if (this.checkJumpable(playerIdx, antiPlayerIdx, matrix, i, j)) {
                            console.log('Why you no eat the other player????');
                            return false;
                        }
                    }
                }
            }
        } else {
            if (this.checkJumpable(playerIdx, antiPlayerIdx, matrix, Math.floor(move[move.length-1] / 10), move[move.length-1] % 10)) {
                console.log('WHY YOU NO EAT THE OTHER PLAYER????');
                return false;
            }
        }

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