/*jslint node: true */
'use strict';

var util = require('util');
var Piece = require('./Piece');

function Checker(matrix, player, move, expandedMove) {
    Piece.abstract.call(this, matrix, player, move, expandedMove);

    this.validDeltas = [9, 10];
    this.validJumps = [19, 21];
}

util.inherits(Checker, Piece.abstract);

Checker.prototype.getPiece = function () {
    return this.player;
};

Checker.prototype.checkPlayingBackwards = function () {
    for (var i = 0; i < this.move.length - 1; i++)  {
        if (this.move[i] > this.move[i + 1]) {
            this.addError('MOVING BACKWARDS', {from: this.move[i], to: this.move[i + 1]});
        }
    }
    return this;
};

Checker.prototype.checkTrajectory = function () {
    for (var i = 0; i < this.move.length - 1; i++)  {
        var delta = this.move[i + 1] - this.move[i];
        var mod = (this.expandedMove[i][0] + 1) % 2;
        if (this.validDeltas.indexOf(delta - mod) === -1 && this.validJumps.indexOf(delta) === -1) {
            this.addError('PLAY DIAGONALY - 1 SLOT OR 2 SLOTS WHEN JUMPING', {from: this.move[i], to: this.move[i + 1]});
        }
    }
    return this;
};

Checker.prototype.checkJumps = function () {
    for (var i = 0; i < this.move.length - 1; i++)  {
        var delta = this.move[i + 1] - this.move[i];
        if (this.validJumps.indexOf(delta) !== -1) {
            var base = delta == 19 ? 9 : 10;
            var mod = (this.expandedMove[i][0] + 1) % 2;
            var pivot = this.move[i] + base + mod;
            if (!this.isOpponentSlot(Math.floor(pivot/10), pivot%10)) {
                this.addError('INVALID PLAY - YOU SHOULD BE JUMPING ON A PIECE.', {from: this.move[i], to: this.move[i + 1], jump: pivot});
            }
            this.jumped.push(pivot);
        } else if (this.move[i + 2] !== undefined) {
            this.addError('ONLY WHEN JUNPING THERE CAN BE ANOTHER PLAY');
        } 
    }
    return this;
};

Checker.prototype.checkJumpable = function (i, j) {
    var mod, pivot1, pivot2, pivot3, pivot4;

    mod = (i + 1) % 2;
    pivot1 = i * 10 + j;
    pivot2 = pivot1 + mod + 9;
    pivot3 = pivot1 + mod + 10;

    if (this.matrix[Math.floor(pivot2/10)] !== undefined && 
        this.isOpponentSlot(Math.floor(pivot2/10), pivot2%10)) {
        pivot4 = pivot1 + 19;
        if (this.matrix[Math.floor(pivot4/10)] !== undefined &&
            this.matrix[Math.floor(pivot4/10)][pivot4%10] === 0
            ) {
            this.addError('SHOULD HAVE JUMPED', {from: pivot1, to: pivot4, jumping: pivot2});
        }

    }

    if (this.matrix[Math.floor(pivot3/10)] !== undefined && 
        this.isOpponentSlot(Math.floor(pivot3/10), pivot3%10)) {
        pivot4 = pivot1 + 21;
        if (this.matrix[Math.floor(pivot4/10)] !== undefined &&
            this.matrix[Math.floor(pivot4/10)][pivot4%10] === 0
            ) {
            this.addError('SHOULD HAVE JUMPED', {from: pivot1, to: pivot4, jumping: pivot3});
        }
    }

};



module.exports = Checker;