var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    /*pixelArt: true,*/
    physics: {
        default: "arcade"
    },
    scene: [new ShitHeadHandler("player" + Math.floor(Math.random() * 10000))]
};

var game = new Phaser.Game(config);