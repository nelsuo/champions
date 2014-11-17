function GameUi() {

    this.ws = null;
    this.gameId = null;
    this.state = null;
    this.players = [];
    this.playerActive = 0;
    this.colors = [
        'white',
        'black'
    ];

    
    this.getPlayerCount = function () {
        return this.players.length;
    };

    this.joinGame = function (gameId) {
        var inverted = false;
        this.gameId = gameId;

        if (this.getPlayerCount() === 1) {
            if (this.players[0].name === 'Dina') {
                inverted = true;
            }
        }

        this.ws = new WebSocket("ws://localhost:9002");
        this.ws.onopen = this.send.bind(this, 'attach-game-ui', {gameId: this.gameId, inverted: inverted});
        this.ws.onmessage = this.receive.bind(this);
        this.ws.onclose = function()
        { 
            // websocket is closed.
            console.log('game interupted');
        };
    };

    this.addPlayer = function(player) {
        var count = this.getPlayerCount();
        this.players.push(player);
        player.setColor(this.colors[count]);
        if (count === 1) {
            player.setInvertedPlay(true);    
        }
    };

    this.start = function () {
        this.send('get-board-state');
    },

    this.printBoard = function(boardState) {
        $('.piece').remove();
        boardState.forEach(function (rowState, row) {
            rowState.forEach(function (cellState, cell) {
                if (cellState !== 0) {
                    var p;
                    switch (cellState) {
                        case 1:
                            p = 'white';
                        break;
                        case 11:
                            p = 'white queen';
                        break;
                        case 2:
                            p = 'black';
                        break;
                        case 22:
                            p = 'black queen';
                        break;
                    }
                    $('.board div[data-row=' + row + '][data-cell=' + cell + ']').append('<div class="piece ' + p + '">');
                }
            });
        });
    },

    this.receive = function (evt) {
        var payload = JSON.parse(evt.data);
        console.log(payload);
        switch(payload.action) {
            case 'board-state':
                this.printBoard(payload.data.board);
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