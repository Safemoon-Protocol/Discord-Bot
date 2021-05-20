const mongoose = require('mongoose')
const { requiredString } = require('.')

const caseSchema = mongoose.Schema({
  guildId: requiredString,
  caseId: requiredString,
  caseType: requiredString,
  caseDate: requiredString,
  moderatorTag: requiredString,
  moderatorId: requiredString,
  userTag: requiredString,
  userId: requiredString,
  reason: requiredString
})

module.exports = mongoose.model('cases', caseSchema)
