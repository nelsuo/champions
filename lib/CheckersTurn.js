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
    this.jumped = [];

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
        this.expandTurnInfo()
            .checkSlotOccupied();

        this.piece.checkInitialPosition()
            .checkPlayingBackwards()
            .checkTrajectory()
            .checkJumps()
            .checkJumpingMoves();

        this.jumped = this.piece.getJumped();

        this.checkMandatoryJumps();

        return this.getErrors().length === 0;
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

    this.checkMandatoryJumps = function () {
        var i, j;

        var pieces = {}, cPiece;
        if (this.isQueen) {
            pieces.queen = this.piece;
        } else {
            pieces.checker = this.piece;
        }

        if (this.jumped.length === 0) {
            for (i = 0 ; i < 8 ; i ++) {
                for (j = 0 ; j < 4 ; j ++) {
                    if (this.piece.isPlayerSlot(i, j)) {
                        cPiece = this.matrix[i][j] > 2 ? 'queen' : 'checker';
                        if (!pieces[cPiece]) {
                            pieces[cPiece] = PieceFactory(
                                cPiece,
                                this.matrix,
                                this.player,
                                this.move,
                                this.expandedMove
                            );
                        }
                        pieces[cPiece].checkJumpable(i, j);
                    }
                }
            }
        } else {
            i = this.expandedMove[this.expandedMove.length - 1][0];
            j = this.expandedMove[this.expandedMove.length - 1][1];
            this.piece.checkJumpable(i, j);
        }
        return this;
    };

    this.checkSlotOccupied = function () {
        this.expandedMove.slice(1).forEach(function (point, index) {
            if (this.matrix[point[0]][point[1]] !== 0) {
                this.addError('CAN\'T MOVE TO OCCUPIED SLOTS', {slot: this.move[index + 1], occupier: this.matrix[point[0]][point[1]]});
            }
            return this;
        }.bind(this));
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

module.exports = CheckersTurn;