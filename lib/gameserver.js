'use strict';

var ws = require('ws');

function _format (action, data) {
    return JSON.stringify({
        action: action,
        data: data
    });
}

exports.start = function() {
    console.log('starting server!');
    var WebSocketServer = ws.Server, 
        wss = new WebSocketServer({port: 9002}),
        gameSequence = 1,
        games = [],
        clientSequence = 1;




    wss.on('connection', function(ws) {
        var board = [
            [1, 1, 1, 1], 
            [1, 1, 1, 1], 
            [1, 1, 1, 1], 
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [2, 2, 2, 2], 
            [2, 2, 2, 2], 
            [2, 2, 2, 2],
        ];
        ws.on('message', function(message) {
                        
            

            var payload = JSON.parse(message);
            console.log(message);
            switch(payload.action) {
                case 'register':
                    ws.send(_format('registered', { client_id: 'CLIENT!' + clientSequence++ }));
                break;
                case 'start':
                    ws.send(_format('started', { game_id: 'GAME!' + gameSequence++ , board: board}));
                break;
                case 'play':
                    console.log(payload.data.player);
                    console.log(payload.data.move);

                    var x1 = Math.floor(payload.data.move[0] / 10);
                    var y1 = payload.data.move[0] % 10;

                    var x2 = Math.floor(payload.data.move[1] / 10);
                    var y2 = payload.data.move[1] % 10;
                    console.log(x1, y1, x2, y2);
                    board[x1][y1] = 0;
                    board[x2][y2] = payload.data.player;

                    ws.send(_format('state', { board: board}));
                break;
            }
        });
    });
};

