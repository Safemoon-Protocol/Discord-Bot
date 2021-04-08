const mongoose = require('mongoose')

const requiredString = {
    type: String,
    required: true
}

const setupSchema = mongoose.Schema({
    _id: requiredString,
    channelId: requiredString,
    text: requiredString
})

module.exports = mongoose.model('setup', setupSchema)