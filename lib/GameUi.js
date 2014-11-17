/*jslint node: true */
'use strict';

function GameUi(connection, game, isInverted) {
    this.connection = connection;
    this.game = game;
    this.isInverted = isInverted;
    console.log(isInverted);
    this.getIsInverted = function () {
        return this.isInverted;
    };

    this.message = function (action, payload) {
        switch(action) {
            case 'get-board-state':
                this.sendBoardState();
            break;
        }
    };

    this.sendBoardState = function () {
        this.connection.send('board-state', {board: this.game.getBoard(this.getIsInverted())});
    };
}

module.exports = GameUi;