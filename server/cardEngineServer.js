const WebSocket = require("ws");
const Game = require("./Game");

var players = [];
var games = [new Game("game0", 4)];
var anyGameIndex = 0;

const server = new WebSocket.Server({port: 1987});
server.on("connection", (socket) => {

    if (socket.protocol !== "cards")
    {
        socket.close(1000, "unsupported protocol");
        return;
    }

    socket.on("message", (message) => {

        var commands = message.split("|");
        console.log("received: %s", commands);
        
        for(let i = 0; i < commands.length; i++)
        {
            var command = commands[i].trim();
            if (command.length === 0)
                continue;
            var args = command.split(" ");
            var player = players.find((pl) => pl.socket === socket);

            switch(args[0]) 
            {
                case "gamestate":
                    if (!player || !player.joinedGame)
                    {
                        console.warn("game or player does not exist");
                        continue;
                    }
                    player.joinedGame.setGameState(args[1]);
                    continue;
                case "gamestatevote":
                    if (!player || !player.joinedGame)
                    {
                        console.warn("game or player does not exist");
                        continue;
                    }
                    player.joinedGame.voteSetGameState(args[1]);

                case "setplayer":
                    if (player)
                    {
                        console.warn("player called setplayer twice, keeping socket, setting name", player.name);
                        player.name = args[1];
                        continue;
                    }
                    var existingPlayer = players.find((pl) => pl.name == args[1]);
                    if (existingPlayer)
                    {
                        if (true || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING)
                        {
                            console.log("player overtook lingering socket", existingPlayer.name);
                            existingPlayer.socket = socket;
                            continue;
                        }
                        else
                        {
                            console.warn("player tried to take over socket but failed!", existingPlayer.name, socket.readyState);
                            socket.close(1008, "cannot take over socket that is not closed yet!");
                            return;
                        }
                    }    
                    else
                    {
                        player = {
                            name: args[1],
                            socket: socket,
                            joinedGame: null
                        };
                        players.push(player);
                    }
                    continue;

                case "joinany":
                    var game = games[anyGameIndex];
                    if (!game || !player)
                    {
                        console.warn("game or player does not exist");
                        continue;
                    }
                    if (player.joinedGame !== null)
                    {
                        console.warn("player already in a game, leaving previous game...", player.name);
                        player.joinedGame.letLeave(player);
                    }
                    if (!game.letJoin(player))
                    {
                        game = new Game("game" + ++anyGameIndex, 4);
                        games.push(game);
                        game.letJoin(player);
                    }
                    socket.send("setmaster " + game.players[0].name);
                    continue;

                case "join":
                    var game = games[parseInt(args[1])];
                    if (!game || !player)
                    {
                        console.warn("game or player does not exist");
                        continue;
                    }
                    if (game.inGame())
                    {
                        console.warn("game already started");
                        continue;
                    }
                    if (player.joinedGame !== null)
                    {
                        console.warn("player already in a game, leaving previous game...", player.name);
                        player.joinedGame.letLeave(player);
                    }
                    if (!game.letJoin(player))
                    {
                        console.log(player.name, "cannot join", game.name);
                        continue;
                    }
                    socket.send("setmaster " + game.players[0].name);
                    continue;
                    
                case "leave":
                    if (!player || !player.joinedGame)
                    {
                        console.warn("cannot leave nothing");
                        continue;
                    }
                    if (!player.joinedGame.letLeave(player))
                    {
                        console.warn("could not leave");
                    }
                    continue;

                case "close":
                    socket.close();
                    continue;

                case "broadcastall":   
                case "broadcast":
                    var includeSender = args[0] === "broadcastall";
                    if (!player || !player.joinedGame)
                    {
                        console.warn("cannot broadcast in nothing");
                        continue;
                    }
                    for(let j = 0; j < player.joinedGame.players.length; j++)
                    {
                        if (includeSender || player.joinedGame.players[j] !== player)
                            player.joinedGame.players[j].socket.send(args.slice(1).join(" "));
                    }
                    continue;

                default:
                    console.error("unknown command", command);
                    continue;
            }
        }

    });

    console.log("connection was made.", socket.protocol);
});