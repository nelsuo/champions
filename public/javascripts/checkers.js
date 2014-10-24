var GameClient = {

    ws: null,

    id: null,

    state: null,

    init: function () {
        this.ws = new WebSocket("ws://localhost:9002");
        this.ws.onopen = this.send.bind(this, 'register', null);
        this.ws.onmessage = this.receive.bind(this);
        this.ws.onclose = function()
        { 
            // websocket is closed.
            console.log('game interupted');
        };
    },

    send: function (action, data) {
        var payload = {
            action: action,
            id: this.id,
            data: data
        };
        console.log(payload);
        this.ws.send(JSON.stringify(payload));
    },

    receive: function (evt) {
        var payload = JSON.parse(evt.data);
        switch(payload.action) {
            case 'registered':
                this.id = payload.data.client_id;
            break;
            case 'started':
                this.gameId = payload.data.game_id;
                this.printBoard(payload.data.board);
            break;
            case 'state':
                this.printBoard(payload.data.board);
            break;
        }
        console.log(payload);
    },

    start: function () {
        this.send('start');
    },

    play: function (player, move) {
        this.send('play', {
            player: player,
            move: move
        });
    },

    newGame: function () {
        this.ws.send('new-game');
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
    }

};



$(document).ready(function () {
    if ("WebSocket" in window) {
        console.log('Connected to server successfully');
        GameClient.init();
    }
});
