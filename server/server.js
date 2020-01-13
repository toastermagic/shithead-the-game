// https://github.com/websockets/ws

const WebSocket = require("ws");
const util = require("util");

const Game = require("./Game");

const server = new WebSocket.Server({port: 1987});

var players = [];
var games = [new Game("game0", 4)];

var gameIndex = 0;

server.on("connection", (socket) => {

    if (socket.protocol !== "cards")
    {
        console.log("wrong protocol");
        socket.close();
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

                case "join":
                    /*var game = games[parseInt(args[1])];
                    if (!game || !player)
                    {
                        console.warn("game or player does not exist");
                        continue;
                    }*/
                    var game = games[gameIndex];
                    if (!game || !player)
                    {
                        console.warn("game or player does not exist");
                        continue;
                    }
                    /*if (game.inGame())
                    {
                        console.warn("game already started");
                        continue;
                    }*/
                    if (game.inGame())
                    {
                        game = new Game("game" + ++gameIndex, 4);
                        games.push(game);
                    }
                    if (!game.letJoin(player))
                    {
                        console.warn("player already in a game", player.name, "leaving...");
                        game.letLeave(player);
                        game.letJoin(player)
                        //continue;
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