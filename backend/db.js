const
    massive = require('massive'),
    {DATABASE_URL} = process.env


let dbInstance

const getDB = async () =>
    dbInstance || (dbInstance = await massive(DATABASE_URL))


module.exports = {
    getDB,
}
