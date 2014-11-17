'use strict';

function Game () {
    
    this.id = null;
    this.getId = function () {
        return this.id;
    };

    this.createGame = function () {
        console.log('connectiong!!!');
        this.ws = new WebSocket("ws://localhost:9002");
        this.ws.onopen = this.send.bind(this, 'create-game', null);
        this.ws.onmessage = this.receive.bind(this);
        this.ws.onclose = function()
        { 
            // websocket is closed.
            console.log('game interupted');
        };
    };

    this.receive = function (evt) {
        var payload = JSON.parse(evt.data);
        console.log(payload);
        switch(payload.action) {
            case 'game-created':
                this.id = payload.data.gameId;
            break;
        }
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
}