function CheckersPlay(matrix, player, move) {

    this.validDeltas = [9, 10];
    this.validJumps = [19, 21];

    this.jumped = [];

    this.matrix = matrix;
    this.player = player;
    this.move = move;
    this.expandedMove = null;

    this.errors = [];

    this.evaluate = function () {
        if (!this.checkMoveLenght()) {
            return false;
        }
        this.expandMovePoints()
            .checkInitialPosition()
            .checkSlotOccupied()
            .checkPlayingBackwards()
            .checkTrajectory()
            .checkJumps()
            .checkMandatoryJumps();

        return this.errors.length === 0;
    };

    this.finish = function() {
        this.jumped.forEach(function (jump) {
            this.matrix[Math.floor(jump/10)][jump%10] = 0;
        }.bind(this));

        this.matrix[this.expandedMove[0][0]][this.expandedMove[0][1]] = 0;
        this.matrix
            [this.expandedMove[this.expandedMove.length - 1][0]]
            [this.expandedMove[this.expandedMove.length - 1][1]] = this.player;
        return this;
    };

    this.getErrors = function () {
        return this.errors;
    };

    this.addError = function (message, info) {
        this.errors.push({
            message: message,
            info: info
        });
    };

    this.expandMovePoints = function () {
        this.expandedMove = move.map(function (point) {
            return [
                  Math.floor(point / 10),
                  point % 10
            ];
        });
        return this;
    };

    this.getPlayerPieces = function () {
        return this.player === 1 ? [ 1, 11 ] : [ 2, 22 ];
    };

    this.getOpponentPieces = function () {
        return this.player === 1 ? [ 2, 22 ] : [ 1, 11 ];
    };

    this.isPlayerSlot = function(i, j) {
        return this.getPlayerPieces().indexOf(this.matrix[i][j]) !== -1;
    };

    this.isOpponentSlot = function (i, j) {
        return this.getOpponentPieces().indexOf(this.matrix[i][j]) !== -1; 
    };

    this.checkMoveLenght = function() {
        if (this.move.length < 2) {
            this.addError('AT LEAST TO POINTS MUST BE PROVIDED', {moveLength: this.move.length});
        }
        return this;
    };

    this.checkInitialPosition = function() {
        if (this.isPlayerSlot(this.matrix[this.expandedMove[0][0]][this.expandedMove[0][1]])) {
            this.addError('FIRST SLOT MUST BE OCCUPIED BY ONE OF YOUR PIECES', {slot: this.move[0], occupier: this.matrix[this.expandedMove[0][0]][this.expandedMove[0][1]]});
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

    this.checkPlayingBackwards = function () {
        for (var i = 0; i < this.move.length - 1; i++)  {
            if (this.move[i] > this.move[i + 1]) {
                this.addError('MOVING BACKWARDS', {from: this.move[i], to: this.move[i + 1]});
            }
        }
        return this;
    };

    this.checkTrajectory = function () {
        for (var i = 0; i < this.move.length - 1; i++)  {
            var delta = this.move[i + 1] - this.move[i];
            var mod = (this.expandedMove[i][0] + 1) % 2;
            if (this.validDeltas.indexOf(delta - mod) === -1 && this.validJumps.indexOf(delta) === -1) {
                this.addError('PLAY DIAGONALY - 1 SLOT OR 2 SLOTS WHEN JUMPING', {from: this.move[i], to: this.move[i + 1]});
            }
        }

        return this;
    };

    this.checkJumps = function () {
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

    this.checkMandatoryJumps = function () {
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

    this.checkJumpable = function (i, j) {
        var mod, pivot1, pivot2, pivot3, pivot4;

        mod = (i + 1) % 2;
        pivot1 = i * 10 + j;
        pivot2 = pivot1 + mod + 9;
        pivot3 = pivot1 + mod + 10;

        
        if (this.matrix[Math.floor(pivot2/10)] !== undefined && 
            this.isOpponentSlot(Math.floor(pivot2/10), pivot2%10)) {
            pivot4 = pivot1 + 19;
            if (matrix[Math.floor(pivot4/10)] !== undefined &&
                matrix[Math.floor(pivot4/10)][pivot4%10] === 0
                ) {
                this.errors.push('SHOULD HAVE JUMPED', {from: pivot1, to: pivot4, jumping: pivot2});
            }

        }

        if (matrix[Math.floor(pivot3/10)] !== undefined && 
            this.isOpponentSlot(Math.floor(pivot3/10), pivot3%10)) {
            pivot4 = pivot1 + 21;
            if (matrix[Math.floor(pivot4/10)] !== undefined &&
                matrix[Math.floor(pivot4/10)][pivot4%10] === 0
                ) {
                this.errors.push('SHOULD HAVE JUMPED', {from: pivot1, to: pivot4, jumping: pivot3});
            }
        }
        
    };

}

module.exports = CheckersPlay;