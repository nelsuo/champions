/*global $:false, console:false, WebSocket:false, window:false */
function HumanPlayer (name) {
    'use strict';

    this.name = name;

    this.id = null;

    this.selected = null;

    this.color = null;

    this.invertedPlay = false;

    this.turnMoves = null;

    this.playTimeout = null;

    this.setInvertedPlay = function (invertedPlay) {
        this.invertedPlay = invertedPlay;
    };

    this.getInvertedPlay = function () {
        return this.invertedPlay;
    };

    this.init = function () {
        this.ws = new WebSocket("ws://localhost:9002");
        this.ws.onopen = function () {
            console.log('ready for action');
        };
        this.ws.onmessage = this.receive.bind(this);    
        this.ws.onclose = function()
        { 
            // websocket is closed.
            console.log('game interupted');
        };
    };

    this.setColor = function (color) {
        this.color = color;
    };

    this.bindUi = function () {
        var that = this;
        $('.piece.' + this.color).off('click').on('click', function (evt) {
            that.selected = $(this);
            var fromSpot = $(this).parent('.spot');
            console.log('SELECTED: ', fromSpot.data('row'), fromSpot.data('cell'));
            return false;
        });

        $('.spot').off('click').on('click', function (evt) {
            that.doMove.call(that, $(this));
        });
    };

    this.wake = function () {
        this.bindUi();
        this.turnMoves = [];
        this.playTimeout = null;
        this.selected = null;
    };

    this.doMove = function (pieceEl) {
        if (this.playTimeout !== null) {
            window.clearTimeout(this.playTimeout);    
        }
        if (this.selected === null) {
            console.error('You must select a piece first');
            return;
        }
        var fromSpot = this.selected.parent('.spot');
        if (this.turnMoves.length === 0) {
            this.turnMoves.push([fromSpot.data('row'), fromSpot.data('cell')]);
            this.turnMoves.push([pieceEl.data('row'), pieceEl.data('cell')]);
        } else {
            this.turnMoves.push([pieceEl.data('row'), pieceEl.data('cell')]);
        }
        this.playTimeout = window.setTimeout(this.play.bind(this), 1000);
    };

    this.unbindUi = function () {
        $('.piece.' + this.color).off('click');
        $('.spot').off('click');
    };

    this.joinGame = function (gameId) {
        this.log('JOINED GAME:' + gameId);
        this.send('add-player', {gameId: gameId});
    };

    this.play = function () {
        var moves = this.turnMoves.map(function (move) {
            if (!this.invertedPlay) {
                return move[0]*10 + move[1];
            } else {
                return Math.abs(7 - move[0])*10 + Math.abs(3 - move[1]);
            }
        }.bind(this));

        this.log(moves);
        this.send('play', {move: moves});
    };

    this.receive = function (evt) {
        var payload = JSON.parse(evt.data);
        
        if (payload.ok === false) {
            console.log(payload.error);
            return;
        }
        switch(payload.action) {
            case 'player_accepted':
                this.id = payload.data.playerId;
            break;
            case 'play_rejected':
                this.turnMoves = [];
            break;
            case 'wake':
                this.log('WAKEN');
                this.wake();
            break;
            case 'sleep':
                this.log('SLEEPING');
                this.unbindUi();
            break;
            case 'victory':
                this.log('VICTORY');
                this.unbindUi();
            break;
            case 'defeat':
                this.log('DEFEAT');
                this.unbindUi();
            break;
        }
        console.log(payload);
    };

    this.getId = function () {
        return this.id;
    };

    this.send = function (action, data) {
        var payload = {
            action: action,
            id: this.id,
            data: data
        };
        console.log(payload);
        this.ws.send(JSON.stringify(payload));
    };

    this.log = function (message) {
        console.log('[' + this.name + '] ', message);
    };

}
