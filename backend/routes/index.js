const
    {readdirSync} = require('fs'),
    {basename, join} = require('path')


module.exports =
    readdirSync(__dirname)
        .filter(file => file !== basename(__filename)) // skip self
        .map(file => require(join(__dirname, file)))
