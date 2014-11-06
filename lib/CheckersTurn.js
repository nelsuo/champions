/*jslint node: true */
'use strict';

var PieceFactory = require('./Piece').factory;

function CheckersTurn(matrix, player, move) {

    this.isQueen = false;
    this.piece = null;
    this.errors = [];
    this.matrix = matrix;
    this.player = player;
    this.move = move;
    this.expandedMove = null;

    this.expandTurnInfo = function () {
        this.expandedMove = move.map(function (point) {
            return [
                  Math.floor(point / 10),
                  point % 10
            ];
        });
        this.isQueen = this.matrix[this.expandedMove[0][0]][this.expandedMove[0][1]] > 2;
        this.piece = PieceFactory(
            this.isQueen?'queen':'checker',
            this.matrix,
            this.player,
            this.move,
            this.expandedMove
        );
        return this;
    };

    this.evaluate = function () {
        if (!this.checkMoveLenght()) {
            return false;
        }
        this.expandTurnInfo();

        this.piece.checkInitialPosition()
            .checkSlotOccupied()
            .checkPlayingBackwards()
            .checkTrajectory()
            .checkJumps()
            .checkMandatoryJumps();
            //.checkJumpingMoves();

        return this.piece.getErrors().length === 0;
    };

    this.finish = function() {
        this.piece.jumped.forEach(function (jump) {
            this.matrix[Math.floor(jump/10)][jump%10] = 0;
        }.bind(this));

        this.matrix[this.expandedMove[0][0]][this.expandedMove[0][1]] = 0;
        this.matrix
            [this.expandedMove[this.expandedMove.length - 1][0]]
            [this.expandedMove[this.expandedMove.length - 1][1]] = this.piece.getPiece();
        return this;
    };

    this.getErrors = function () {
        return this.errors.concat(this.piece.getErrors());
    };

    this.addError = function (message, info) {
        this.errors.push({
            message: message,
            info: info
        });
    };


    this.checkMoveLenght = function() {
        if (this.move.length < 2) {
            this.addError('AT LEAST TO POINTS MUST BE PROVIDED', {moveLength: this.move.length});
        }
        return this;
    };

}

// console.log('ct 31 73', checkQueenTrajectory(31, 73));
// console.log('ct 0 53', checkQueenTrajectory(0, 53));
// console.log('ct 20 62', checkQueenTrajectory(20, 62));
// console.log('ct 03 22', checkQueenTrajectory(3, 22));
// console.log('ct 41 60', checkQueenTrajectory(41, 60));
// console.log('ct 03 60', checkQueenTrajectory(3, 60));
// console.log('ct 60 11', checkQueenTrajectory(60, 11));

module.exports = CheckersTurn;