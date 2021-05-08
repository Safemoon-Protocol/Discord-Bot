const mongoose = require('mongoose')
const { requiredString } = require('.')

const loggingSchema = mongoose.Schema({
  guildId: requiredString,
  channelId: requiredString,
  logType: requiredString
})

module.exports = mongoose.model('log_channels', loggingSchema)
