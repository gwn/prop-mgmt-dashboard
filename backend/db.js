const massive = require('massive');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

let dbInstance;

async function connectDb() {
  if (!dbInstance) {
    dbInstance = await massive(connectionString, { scripts: false });
  }
  return dbInstance;
}

module.exports = { connectDb };
