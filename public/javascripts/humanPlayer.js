'use strict';

function HumanPlayer () {

    this.id = null;

    this.selected = null;

    this.game = null;

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

    this.bindUi = function () {
        var that = this;
        $('.piece').off('click').on('click', function (evt) {
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
                fromSpot.data('row')*10 + fromSpot.data('cell'),
                $(this).data('row')*10 + $(this).data('cell')
            ]);
            that.selected = null;
        });
    };

    this.joinGame = function (game) {
        this.game = game;
        game.addPlayer(this);
        this.send('join-game', {gameId: game.getId()});
    };

    this.play = function (move) {
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
        }
        console.log(payload);
    },

    this.getId = function () {
        return this.id;
    },

    this.send = function (action, data) {
        var payload = {
            action: action,
            id: this.id,
            data: data
        };
        console.log(payload);
        this.ws.send(JSON.stringify(payload));
    };

}