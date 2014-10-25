'use strict';

function GameBot () {

    this.id = null;

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
    

    this.joinGame = function (gameId) {
        this.send('join-game', {gameId: gameId});
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


};