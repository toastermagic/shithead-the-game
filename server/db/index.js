const {
  Pool
} = require('pg');

pool = new Pool();

module.exports = {
  query: (text, params) => pool.query(text, params)
}