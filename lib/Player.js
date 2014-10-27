'use strict';

var playerSequence = 1;

function Player(connection) {
    this.connection = connection;
    this.game = null;
    this.number = null;

    this.id = 'PLAYER!' + playerSequence ++;

    this.getId = function () {
        return this.id;
    };

    this.setNumber = function (number) {
        this.number = number;
    };

    this.getNumber = function () {
        return this.number;
    };

    this.wake = function () {
        this.connection.send('wake');
    };

    this.sleep = function () {
        this.connection.send('sleep');
    };

    this.message = function (action, payload) {
        switch(action) {
            case 'play':
                if (this.game.play(this, payload.move)) {
                    this.connection.send('play_accepted');    
                } else {
                    this.connection.send('play_rejected');    
                }
                
            break;
        }
    };

    this.setGame = function (game) {
        this.game = game;
    };
}

module.exports = Player;