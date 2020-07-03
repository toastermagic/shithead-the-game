fs = require('fs');

module.exports = class Storage {

  scores = {};
  ready = false;

  constructor() {
    if (fs.existsSync('/public/assets/scores.json')) {
      fs.readFile('./scores.json', 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        }
        try {
          this.scores = JSON.parse(data);
        }
        catch {
          console.error('could not load scores')
          this.scores = {};
        }
        this.ready = true;
      });
    } else {
      this.ready = true;
    }
  }

  writeScores() {
    const data = JSON.stringify(this.scores, null, 2);
    fs.writeFileSync('/public/assets/scores.json', data);
  }

  playerWin(playerName) {
    if (this.scores[playerName]) {
      this.scores[playerName].wins++;
    } else {
      this.scores[playerName] = {
        wins: 1
      }
    }
    this.writeScores();
  }

  getScores() {
    return this.scores;
  }
}