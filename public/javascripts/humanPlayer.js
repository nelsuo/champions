'use strict';

function HumanPlayer (name) {

    this.name = name;

    this.id = null;

    this.selected = null;

    this.game = null;

    this.color = null;

    this.naturalDirection = true;

    this.setNaturalDirection = function (naturalDirection) {
        this.naturalDirection = naturalDirection;
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
            if (that.selected === null) {
                console.error('You must select a piece first');
                return;
            }
            var fromSpot = that.selected.parent('.spot');
            that.play([
                [fromSpot.data('row'), fromSpot.data('cell')],
                [$(this).data('row'), $(this).data('cell')]
            ]); 
                
            that.selected = null;
        });
    };

    this.unbindUi = function () {
        $('.piece.' + this.color).off('click');
        $('.spot').off('click');
    };

    this.joinGame = function (game) {
        this.log('JOINED GAME:' + game.getId());
        this.game = game;
        game.addPlayer(this);
        this.send('join-game', {gameId: game.getId()});
    };

    this.play = function (move) {
        this.log('PLAYED: ' + move);
        console.log(this.naturalDirection);
        if (this.naturalDirection) {
            move = [
                move[0][0]*10 + move[0][1],
                move[1][0]*10 + move[1][1]
            ];
        } else {
            // invert move before send
            move = [
                Math.abs(7 - move[0][0])*10 + Math.abs(3 - move[0][1]),
                Math.abs(7 - move[1][0])*10 + Math.abs(3 - move[1][1])
            ];
        }
        console.log(move);
        this.send('play', {move: move});
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
            case 'wake':
                this.log('WAKEN');
                this.bindUi();
            break;
            case 'sleep':
                this.log('SLEEPING');
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