const mongoose = require('mongoose')
const { mongoPath } = require('./config.json')
const { MONGO_INITDB_DATABASE_NAME } = process.env

module.exports = () => {
  return mongoose.connect(mongoPath, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: MONGO_INITDB_DATABASE_NAME || 'discordbot'
  })
}
