/*jslint node: true */
'use strict';

var util = require('util');
var Piece = require('./Piece');

function Queen(matrix, player, move, expandedMove) {
    Piece.abstract.call(this, matrix, player, move, expandedMove);
}

util.inherits(Queen, Piece.abstract);

Queen.prototype.getPiece = function () {
    return parseInt(this.player.toString() + this.player.toString());
};

Queen.prototype.checkPlayingBackwards = function () {
    return this;
};

Queen.prototype.checkTrajectory = function() {
    var p1, p2, i, x1, y1, x2, y2, mod, n;
    for (i = 0; i < this.move.length - 1; i++)  {
        x1 = this.expandedMove[i][0];
        y1 = this.expandedMove[i][1];
        x2 = this.expandedMove[i + 1][0];
        y2 = this.expandedMove[i + 1][1]; 
        mod = x2 > x1 ? y1 < y2 ? 1 : 0 : y1 > y2 ? 1 : 0;
        n = Math.abs(x2 - x1);
        if (Math.abs(this.move[i + 1] - this.move[i]) !== 
            Math.floor(n / 2) * 2 * (9.5 + mod) + ((10 + mod) * (n%2))) {
            this.addError('INVALID QUEEN MOVE', {from: this.move[i], to: this.move[i + 1]});
        }
    }
    return this;
};

Queen.prototype.checkJumps = function () {
    return this;
};

Queen.prototype.checkJumpable = function() {
    return this;
};

module.exports = Queen;