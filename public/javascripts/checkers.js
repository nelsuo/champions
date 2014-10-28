'use strict';

var GameClient = {
    ws: null,
    id: null,
    state: null,
    players: [],
    playerActive: 0,
    colors: [
        'white',
        'black'
    ],

    getId: function () {
        return this.id;
    },

    init: function () {
        this.ws = new WebSocket("ws://localhost:9002");
        this.ws.onopen = this.send.bind(this, 'create-game', null);
        this.ws.onmessage = this.receive.bind(this);
        this.ws.onclose = function()
        { 
            // websocket is closed.
            console.log('game interupted');
        };
    },

    addPlayer: function(player) {
        var count = this.getPlayerCount();
        this.players.push(player);
        player.setColor(this.colors[count]);
        if (count === 1) {
            player.setNaturalDirection(false);    
        }
    },

    getPlayerCount: function () {
        console.log(this);
        return this.players.length;
    },

    receive: function (evt) {
        var payload = JSON.parse(evt.data);
        console.log(payload);
        switch(payload.action) {
            case 'game-created':
                this.id = payload.data.gameId;
            break;
            case 'board-state':
                this.printBoard(payload.data.board);
            break;
            case 'turn-done':
                this.printBoard(payload.data.board);
                this.turn();
            break;
        }
    },

    start: function () {
        this.send('get-board-state');
    },

    printBoard: function(boardState) {
        $('.piece').remove();
        boardState.forEach(function (rowState, row) {
            rowState.forEach(function (cellState, cell) {
                if (cellState !== 0) {
                    var p;
                    switch (cellState) {
                        case 1:
                            p = 'white';
                        break;
                        case 2:
                            p = 'black';
                        break;
                    }
                    $('.board div[data-row=' + row + '][data-cell=' + cell + ']').append('<div class="piece ' + p + '">');
                }
            });
        });
    },

    send: function (action, data) {
        var payload = {
            action: action,
            id: this.id,
            data: data
        };
        console.log(payload);
        this.ws.send(JSON.stringify(payload));
    }

};



$(document).ready(function () {
    if ("WebSocket" in window) {
        console.log('Connected to server successfully');
        GameClient.init();
    }
});
