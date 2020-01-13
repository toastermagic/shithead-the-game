module.exports = class Game 
{
    constructor(name, maxPlayers = 4)
    {
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.players = [];
        this.gameState = "waiting";
        this.gameStateVoteCount = 0;
    }

    inGame()
    {
        return this.gameState !== "waiting";
    }

    letJoin(player)
    {
        if (this.players.length >= this.maxPlayers || player.joinedGame != null || this.players.find((pl) => pl == player))
            return false;

        this.sentInit(player);
        if (this.players.length > 0)
            this.sendPlayersAlreadyJoined(player, this.players);
        for(let i = 0; i < this.players.length; i++)
            this.sendPlayerJoined(this.players[i], player);

        player.joinedGame = this;
        this.players.push(player);
        return true;
    }

    letLeave(player)
    {
        if (!this.players.find((pl) => pl == player))
            return false;

        this.players.splice(this.players.indexOf(player), 1);
        player.joinedGame = null;

        for(let i = 0; i < this.players.length; i++)
            this.sendPlayerLeft(this.players[i], player);
        return true;
    }

    setGameState(newState = "waiting")
    {
        if (this.gameState === newState)
        {
            console.warn("game is already in state:" + newState);
            return;
        }

        this.gameState = newState;
        this.players.forEach((player) => this.sendGameState(player));
    }

    voteSetGameState(newState = "waiting")
    {
        if (++this.gameStateVoteCount < this.players.length)
            return;

        this.gameStateVoteCount = 0;
        this.setGameState(newState);
    }

    sendGameState(toPlayer)
    {
        toPlayer.socket.send("gamestate " + this.gameState);
    }
    
    sentInit(player)
    {
        player.socket.send("game shithead");
    }

    sendPlayerLeft(toPlayer, leftPlayer)
    {
        toPlayer.socket.send("playerleft " + leftPlayer.name);
    }

    sendPlayersAlreadyJoined(toPlayer, alreadyJoinedPlayers)
    {
        var command = "playersalreadyjoined ";
        for(let i = 0; i < alreadyJoinedPlayers.length; i++)
        {
            if (i !== 0)
                command += ",";
            command += alreadyJoinedPlayers[i].name;
        }
        toPlayer.socket.send(command);
    }

    sendPlayerJoined(toPlayer, joinedPlayer)
    {
        toPlayer.socket.send("playerjoined " + joinedPlayer.name);
    }
}