const mongoose = require('mongoose')
const { requiredString } = require('.')

const loggingSchema = mongoose.Schema({
  guildId: requiredString,
  logType: requiredString,
  logChannel: requiredString
})

module.exports = mongoose.model('log_channels', loggingSchema)
