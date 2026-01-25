const
    {getDB} = require('../db'),
    {generateUpsertHandler} = require('./createProperty')


module.exports = generateUpsertHandler(false)
