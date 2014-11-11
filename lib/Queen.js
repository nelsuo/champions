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

// TODO: no need to expand the matrix, you'll find the solution on: checkJumpable
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
    // calculate the horizontal point on a full matrix
    n = (((x1+1) % 2) + (y1) * 2);

    // check the move direction vertically
    x = (p1 > p2 ? - 1 : 1 );

    // check the move direction horizontaly
    y = x1%2 === 0 ? y1 >= y2 ? -1 : 1 : y1 > y2 ? -1 : 1;
    m = n + y;

    // calculate the next horizontal point
    o =  + Math.ceil(m / 2) - ((x1) % 2);

    // vall the function for the next slot
    k = this.checkPath((x1+x)*10 + o, p2, level + 1);
    k.push([x1,y1]);
    return k;
};

Queen.prototype.checkJumps = function () {
    var slots, jump, done, started, jumped;
    for (var i = 0; i < this.move.length - 1; i++)  {
        slots = this.checkPath(this.move[i + 1], this.move[i]);
        console.log('checking jumps!!', slots);
        jump = [];
        done = false;
        started = false;
        jumped = false;
        slots.slice(1).forEach(function (slot) {
            if (done) {
                return;
            }
            if (this.isPlayerSlot(slot)) {
                this.addError('YOU CAN\'T JUMP OVER YOUR OWN PIECES');
                done = true;
            }
            if (this.isOpponentSlot(slot)) {
                jump[0] = slot;
                started = true;
                return;
            }
            if (started && this.isOpponentSlot(slot)) {
                this.addError('YOU CAN\'T JUMP OVER TWO OPPONENT PIECES IN ONE TURN');
                return;
            }
            if (started && this.isEmptySlot(slot)) {
                jumped = true;
                jump[1] = slot;
                done = true;
                return;
            }

            if (this.isPlayerSlot(slot)) {
                this.addError('YOU CAN\'T JUMP OVER YOUR OWN PIECES');
                done = true;
                return;
            }
        }.bind(this));
        if (!jumped && this.move[i + 2]) {
             this.addError('ONLY WHEN JUNPING THERE CAN BE ANOTHER PLAY');
        } else if (jumped) {
            this.jumped.push(jump[0][0]*10 + jump[0][1]);
        }
    }
    return this;
};

/**
 * this method is much better than the checkPath all because of the way "y" is calculated
 * this will be a strong basis to build the bot
 * also this will help us refactore all the way positions are found within the board
 * @param  {[type]} i [description]
 * @param  {[type]} j [description]
 * @param  {[type]} v [description]
 * @param  {[type]} h [description]
 * @return {[type]}   [description]
 */
Queen.prototype._buildPath = function (i, j, v, h) {
    var n, x, y, r;
    n = (((i+1) % 2) + (j) * 2);
    x = i + v;
    y = j + ((i+1)%2 === 0 ? h < 0 ? -1 : 0 : h < 0 ? 0 : 1);
    if (this.matrix[x] === undefined || this.matrix[x][y] === undefined) {
        return [[i, j]];
    }
    r = this._buildPath(x, y, v, h);
    r.push([i, j]);
    return r;
};

Queen.prototype.buildPath = function (i, j, v, h) {
    return this._buildPath(i, j, v, h).reverse();
};


/**
 * Check if there are jumps to be made.
 * @param  {[type]} i [description]
 * @param  {[type]} j [description]
 * @return {[type]}   [description]
 */

Queen.prototype.getJumpableInPath = function(i, j, v, h) {
    var path = this.buildPath(i, j, v, h),
        started = false, jumpable = false, jump = [], done = false;
    path.slice(1).forEach(function (slot) {
        if (done) {
            return;
        }
        if (this.isJumped(slot)) {
            done = true;
            return;
        }
        if (this.isPlayerSlot(slot)) {
            done = true;
            return;
        }
        if (this.isOpponentSlot(slot)) {
            jump[0] = slot;
            started = true;
            return;
        }
        if (started && this.isOpponentSlot(slot)) {
            done = true;
            return;
        }
        if (started && this.isEmptySlot(slot)) {
            jumpable = true;
            jump[1] = slot;
            done = true;
            return;
        }
    }.bind(this));
    return jumpable ? jump : null ;
};

Queen.prototype.checkJumpable = function(i, j) {
    var jumpable, paths = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    paths.forEach(function (path) {
        jumpable = this.getJumpableInPath(i, j, path[0], path[1]);
        if (jumpable !== null) {
            this.addError('SHOULD HAVE JUMPED', {from: i*10+j, to: jumpable[1][0]*10+jumpable[1][1], jumping: jumpable[0][0]*10+jumpable[0][1]});
        }
    }.bind(this));
    return this;
};

module.exports = Queen;