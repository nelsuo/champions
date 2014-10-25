'use strict';

// criar jogador humano
// criar regras de validação
// criar os primeiros bots
// criar um segundo jogo

function mock() {
    GameClient.start();
    var bot1 = new GameBot();
    bot1.init();
    window.setTimeout(function () {
        bot1.joinGame('GAME!1');
        bot1.play([20, 30]);    
    }, 200);
    
}

var GameClient = {
    ws: null,
    id: null,
    state: null,

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

    receive: function (evt) {
        var payload = JSON.parse(evt.data);
        switch(payload.action) {
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

    newGame: function () {
        this.send('new-game', {game_type: 'checkers'});
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
