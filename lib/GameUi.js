/*jslint node: true */
'use strict';

function GameUi(connection, game) {
    this.connection = connection;
    this.game = game;
    
    this.message = function (action, payload) {
        switch(action) {
            case 'get-board-state':
                this.sendBoardState();
            break;
        }
    };

    this.sendBoardState = function () {
        this.connection.send('board-state', {board: this.game.getBoard()});
    };
}

module.exports = GameUi;