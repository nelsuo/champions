// criar jogador humano --- cool!!!
// implementar a gestão dos turnos --- cool!!!
// turn logic must be on the server side --- cool!!!
// when receiving data from play, we should always receive growing numbers. This is super important!! --- cool
// row number must be considered to calculate the valid plays. --- cool

//      ... maybe the board is always the same
// create validations for plays --- doing queens missing!
//      ... being able to eat two pieces at a play. implement it on the client and server side --- cool
//      ... implement mandatory jumps --- cool
//      ... add inheritance to pieces, this will be very usefull for chess, and also js in general --- cool
//      ... implement Queens
//      ... implement victory / draw.
//      ... implement rules as array of functions
//      ... from the rules point of view, player should be always the same, invert it if needed before validating.


// understand better how the perspectives should work
// create my first bot
// create a second game - probably naval battle... mathmaticians tic tac toe ... chess
// improve gaming management
// host the code, get a dynip
// improve graphics and ui ... drag and drop and textures for the win


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

window.setTimeout(function () {
    mockHuman();
}, 800);