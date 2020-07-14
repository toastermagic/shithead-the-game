fs = require('fs');
const {
  InfluxDB,
  Point,
  HttpError
} = require('@influxdata/influxdb-client')
const {
  hostname
} = require('os');
const {
  write
} = require('fs');

const url = "https://influx.boomtown.org.uk";
const token = process.env.INFLUX_TOKEN;
const org = "boomtown";
const bucket = "shithead";

module.exports = class Storage {
  writeApi;
  scores = {};
  ready = false;

  constructor() {
    this.writeApi = new InfluxDB({
      url,
      token
    }).getWriteApi(org, bucket, 'ns')

    this.writeApi.useDefaultTags({
      location: hostname()
    })
  }

  writeWinner(winnerName, winPoints) {
    const newPoint = new Point("winner")
      .tag('winner', winnerName)
      .intField('numPoints', +winPoints);
    this.writeInflux(newPoint);
  }

  writeLoser(loserName) {
    const newPoint = new Point("loser")
      .tag('loser', loserName)
      .intField('numPoints', -1);
    this.writeInflux(newPoint);
  }

  writeCard(playerName, cardValue) {
    const newPoint = new Point("card")
      .tag('player', playerName)
      .intField('cardValue', +cardValue);
    this.writeInflux(newPoint);
  }

  writeBurn(playerName, cardsBurnt) {
    const newPoint = new Point("burn")
      .tag('player', playerName)
      .intField('numCards', +cardsBurnt);
    this.writeInflux(newPoint);
  }

  writePickup(playerName, cardsPickedUp) {
    const newPoint = new Point("pickup")
      .tag('player', playerName)
      .intField('numCards', +cardsPickedUp);
    this.writeInflux(newPoint);
  }

  writeInflux(newPoint) {
    this.writeApi
      .writePoint(newPoint);
    this.writeApi
      .close()
      .then(() => {
        console.log(`point written to influx: ${newPoint.toLineProtocol(this.writeApi)}`);
      })
      .catch(e => {
        console.log('influx write failed');
        console.error(e);
      })
  }
}