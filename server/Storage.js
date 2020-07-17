const db = require('./db')

module.exports = class Storage {
  writeApi;
  scores = {};
  ready = false;

  constructor() {}

  async writeResult(playerName, winPoints) {
    const q = 'INSERT INTO result(time, player, points) values($1, $2, $3)'
    const data = ['now()', playerName, winPoints];
    const {
      rows
    } = await db.query(q, data);
  }

  async writeCard(playerName, cardValue) {
    const q = 'INSERT INTO cards(time, player, cardValue) values($1, $2, $3)'
    const data = ['now()', playerName, cardValue];
    const {
      rows
    } = await db.query(q, data);
  }

  async writeBurn(playerName, cardsBurnt) {
    const q = 'INSERT INTO burn(time, player, numCards) values($1, $2, $3)'
    const data = ['now()', playerName, cardsBurnt];
    const {
      rows
    } = await db.query(q, data);
  }

  async writePickup(playerName, cardsPickedUp) {
    const q = 'INSERT INTO pickup(time, player, numCards) values($1, $2, $3)'
    const data = ['now()', playerName, cardsPickedUp];
    const {
      rows
    } = await db.query(q, data);
  }
}