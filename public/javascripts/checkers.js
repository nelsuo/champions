'use strict';

// criar jogador humano --- cool!!!
// implementar a gestão dos turnos --- cool!!!
// criar regras de validação
// criar o primeiro bot
// criar um segundo jogo

function mockHuman() {
    GameClient.start();
    var human1 = new HumanPlayer('Nelson');
    var human2 = new HumanPlayer('Dina');
    human1.init();
    human2.init();
    window.setTimeout(function () {
        human1.joinGame(GameClient);
        human2.joinGame(GameClient);
    }, 200);
}

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
        if (count + 1 === 2) {
            this.turn();
        }
    },

    getPlayerCount: function () {
        console.log(this);
        return this.players.length;
    },

    turn: function () {
        if (this.playerActive > 1) {
            this.playerActive = 0;
        }
        this.players[!this.playerActive * 1].sleep();
        this.players[this.playerActive].wake();
        this.playerActive ++;
    },

    receive: function (evt) {
        var payload = JSON.parse(evt.data);
        console.log(payload);
        switch(payload.action) {
            case 'game-created':
                this.id = payload.data.gameId;
            break;
            case 'state':
                this.printBoard(payload.data.board);
            break;
            case 'turn-done':
                this.printBoard(payload.data.board);
                this.turn();
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
