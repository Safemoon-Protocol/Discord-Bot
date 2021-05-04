const mongoose = require('mongoose')
const { requiredString } = require('.')

const channels = mongoose.Schema({
    _id: requiredString,
    channelId: requiredString,
    text: requiredString
})

module.exports = mongoose.model('channels', channels)
