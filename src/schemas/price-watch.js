const mongoose = require('mongoose')
const { requiredString } = require('.')

const priceWatchSchema = mongoose.Schema({
  _id: requiredString,
  channelId: requiredString,
  text: requiredString
})

module.exports = mongoose.model('setup', priceWatchSchema)
