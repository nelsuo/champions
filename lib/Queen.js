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
    var i, x1, y1, x2, y2, m, n;
    for (i = 0; i < this.move.length - 1; i++)  {
        x1 = this.expandedMove[i][0];
        y1 = this.expandedMove[i][1];
        x2 = this.expandedMove[i + 1][0];
        y2 = this.expandedMove[i + 1][1]; 
       
        m = Math.abs((((x2 + 1) % 2) + (y2) * 2) - (((x1 + 1) % 2) + (y1) * 2));
        n = Math.abs(x2 - x1);
        
        if (m !== n) {
            this.addError('INVALID QUEEN MOVE', {from: this.move[i], to: this.move[i + 1]});
        }
    }
    return this;
};

Queen.prototype.checkPath = function (p1, p2, level) {
    var x1, x2, y1, y2, n, m, x, y, o, k;
    if (!level) {
        level = 0;
    }
    x1 = Math.floor(p1 / 10);
    x2 = Math.floor(p2 / 10);
    y1 = p1 % 10;
    y2 = p2 % 10;
    if (p1 === p2 || level > 5) {
        return [[x2, y2]];
    }
    n = (((x1+1) % 2) + (y1) * 2);
    x = (p1 > p2 ? - 1 : 1 );
    y = x1%2 === 0 ? y1 >= y2 ? -1 : 1 : y1 > y2 ? -1 : 1;
    m = n + y;
    o =  + Math.ceil(m / 2) - ((x1) % 2);
    k = this.checkPath((x1+x)*10 + o, p2, level + 1);
    k.push([x1,y1]);
    return k;
};

Queen.prototype.checkJumps = function () {
    var slots, jumps;
    for (var i = 0; i < this.move.length - 1; i++)  {
        slots = this.checkPath(this.move[i + 1], this.move[i]);
        jumps = [];
        slots.slice(1).forEach(function (slot) {
            console.log('SLOT:', this.matrix[slot[0]][slot[1]]);
            if (this.matrix[slot[0]][slot[1]] !== 0) {
                console.log(slot[0] * 10 + slot[1]);
                jumps.push(slot[0] * 10 + slot[1]);
            }
        }.bind(this));
        if (jumps.length === 0 && this.move[i + 2]) {
             this.addError('ONLY WHEN JUNPING THERE CAN BE ANOTHER PLAY');
        } else if (jumps.length > 1) {
            console.log(jumps);
            this.addError('YOU CAN ONLY JUMP ONCE PER MOVE');
        } else if (jumps.length) {
            console.log('hey???', jumps);
            this.jumped.push(jumps[0]);
        }
    }
    return this;
};

Queen.prototype.checkJumpable = function() {
    return this;
};

module.exports = Queen;