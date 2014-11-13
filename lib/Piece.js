/*jslint node: true */
'use strict';

function Piece (matrix, player, move, expandedMove) {
    this.matrix = matrix;
    this.player = player;
    this.move = move;
    this.expandedMove = expandedMove;
    this.errors = [];
    this.jumped = [];
    return this;
}

Piece.prototype.getQueen = function () {
    return this.player === 1 ? 11 : 22;
};

Piece.prototype.getPlayerPieces = function () {
    return this.player === 1 ? [ 1, 11 ] : [ 2, 22 ];
};

Piece.prototype.getOpponentPieces = function () {
    return this.player === 1 ? [ 2, 22 ] : [ 1, 11 ];
};

Piece.prototype.isPlayerSlot = function(i, j) {
    if (j === undefined) {
        j = i[1];
        i = i[0];
    }
    return this.getPlayerPieces().indexOf(this.matrix[i][j]) !== -1;
};

Piece.prototype.isOpponentSlot = function (i, j) {
    if (j === undefined) {
        j = i[1];
        i = i[0];
    }
    return this.getOpponentPieces().indexOf(this.matrix[i][j]) !== -1; 
};

Piece.prototype.isJumped = function (i, j) {
    if (j === undefined) {
        j = i[1];
        i = i[0];
    }
    return this.jumped.indexOf(i * 10 + j) !== -1; 
};

Piece.prototype.isEmptySlot = function (i, j) {
    if (j === undefined) {
        j = i[1];
        i = i[0];
    }
    return this.matrix[i][j] === 0; 
};

Piece.prototype.getErrors = function () {
    return this.errors;
};

Piece.prototype.clearErrors = function () {
    this.errors = [];
    return this;
};

Piece.prototype.getJumped = function () {
    return this.jumped;
};

Piece.prototype.addError = function (message, info) {
    this.errors.push({
        message: message,
        info: info
    });
};

Piece.prototype.checkInitialPosition = function() {
    if (!this.isPlayerSlot(this.expandedMove[0][0],this.expandedMove[0][1])) {
        this.addError('FIRST SLOT MUST BE OCCUPIED BY ONE OF YOUR PIECES', {slot: this.move[0], occupier: this.matrix[this.expandedMove[0][0]][this.expandedMove[0][1]]});
    }
    return this;
};

Piece.prototype.checkJumpingMoves = function () {
    if (this.move.length > 2 && this.move.length - 1 > this.jumped.length) {
        this.addError('YOU MAY ONLY MOVE MORE THAN ONCE WHEN JUMPING PIECES', {moves: this.move.length - 1, jumps: this.jumped.length});
    }
};

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