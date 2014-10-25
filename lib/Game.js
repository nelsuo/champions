'use strict';

var gameSequence = 1;



function Game(uiConnection) {
    this.uiConnection = uiConnection;
    this.id = 'GAME!' + gameSequence ++;
    this.playerCount = 0;
    this.players = {};
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
    
    this.play = function (player, move) {
        // check play validity!!!!!!
         
        
        var x1 = Math.floor(move[0] / 10);
        var y1 = move[0] % 10;

        var x2 = Math.floor(move[1] / 10);
        var y2 = move[1] % 10;
        console.log(x1, y1, x2, y2);
        
        this.board[x1][y1] = 0;
        this.board[x2][y2] = player.getNumber();


        this.send('state', { board: this.board});
        return true;
    };

    this.getId = function () {
        return this.id;
    };

    this.message = function (action, payload) {
        console.log(action, payload);
        switch(action) {
            case 'start':
                this.send('state', { board: this.board});
            break;
        }
    };

    this.addPlayer = function (player) {
        player.setGame(this);
        player.setNumber(this.playerCount + 1);
        this.players[player.getId()] = player;
        this.playerCount ++;
    };

    this.getPlayerCount = function () {
        return this.playerCount;
    };

    this.send = function (action, data) {
        this.uiConnection.send(action, data);
    };
}

module.exports = Game;