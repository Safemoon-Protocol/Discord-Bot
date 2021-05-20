const mongoose = require('mongoose')
const { requiredString, requiredNumber } = require('.')

const roleScheduleSchema = mongoose.Schema({
  guildId: requiredString,
  roleId: requiredString,
  minimumLifeInGuild: requiredNumber,
  minimumLifeOnDiscord: requiredNumber
})

module.exports = mongoose.model('role_schedule', roleScheduleSchema)
