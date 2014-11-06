/*jslint node: true */
'use strict';

function Piece (matrix, player, move, expandedMove) {
    this.matrix = matrix;
    this.player = player;
    this.move = move;
    this.expandedMove = expandedMove;
    console.log(this.expandedMove);
    this.errors = [];
    this.jumped = [];
    return this;
}

Piece.prototype.getPlayerPieces = function () {
    return this.player === 1 ? [ 1, 11 ] : [ 2, 22 ];
};

Piece.prototype.getOpponentPieces = function () {
    return this.player === 1 ? [ 2, 22 ] : [ 1, 11 ];
};

Piece.prototype.isPlayerSlot = function(i, j) {
    return this.getPlayerPieces().indexOf(this.matrix[i][j]) !== -1;
};

Piece.prototype.isOpponentSlot = function (i, j) {
    return this.getOpponentPieces().indexOf(this.matrix[i][j]) !== -1; 
};

Piece.prototype.getErrors = function () {
    return this.errors;
};

Piece.prototype.addError = function (message, info) {
    this.errors.push({
        message: message,
        info: info
    });
};

Piece.prototype.checkInitialPosition = function() {
    console.log(this);
    console.log(this.expandedMove);
    if (!this.isPlayerSlot(this.expandedMove[0][0],this.expandedMove[0][1])) {
        this.addError('FIRST SLOT MUST BE OCCUPIED BY ONE OF YOUR PIECES', {slot: this.move[0], occupier: this.matrix[this.expandedMove[0][0]][this.expandedMove[0][1]]});
    }
    return this;
};

Piece.prototype.checkMandatoryJumps = function () {
    var i, j;
    if (this.jumped.length === 0) {
        for (i = 0 ; i < 8 ; i ++) {
            for (j = 0 ; j < 4 ; j ++) {
                if (this.isPlayerSlot(i, j)) {
                    this.checkJumpable(i, j);
                }
            }
        }
    } else {
        i = this.expandedMove[this.expandedMove.length - 1][0];
        j = this.expandedMove[this.expandedMove.length - 1][1];
        this.checkJumpable(i, j);
    }
    return this;
};

Piece.prototype.checkSlotOccupied = function () {
    this.expandedMove.slice(1).forEach(function (point, index) {
        if (this.matrix[point[0]][point[1]] !== 0) {
            this.addError('CAN\'T MOVE TO OCCUPIED SLOTS', {slot: this.move[index + 1], occupier: this.matrix[point[0]][point[1]]});
        }
        return this;
    }.bind(this));
    return this;
};

// Piece.prototype.checkJumpingMoves = function () {
//     console.log('oi:', this.move.length - 2);
//     console.log(this.jumped.length);
//     if (this.move.length - 2 > this.jumped.length) {
//         this.addError('YOU MAY ONLY MOVE MORE THAN ONCE WHEN JUMPING PIECES', {moves: this.move.length - 1, jumps: this.jumped.length});
//     }
// };

function factory (type, matrix, player, move, expandedMove) {
    var Queen = require('./Queen');
    var Checker = require('./Checker');
    var instance = null;
    switch (type) {
        case 'queen':
            instance = new Queen(matrix, player, move, expandedMove);
        break;
        case 'checker':
            instance = new Checker(matrix, player, move, expandedMove);
        break;
        default:
            throw new Error('There are only two king of pieces in this game: [checker, queen]');
    }
    return instance;
}

module.exports = {
    abstract: Piece,
    factory: factory
};