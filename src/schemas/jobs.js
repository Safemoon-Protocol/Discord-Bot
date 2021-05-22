const mongoose = require('mongoose')
const { requiredString, requiredBool, nonRequiredNumber, nonRequiredString } = require('.')

const jobsSchema = mongoose.Schema({
  guildId: requiredString,
  jobName: requiredString,
  jobState: requiredBool,
  jobInterval: nonRequiredNumber,
  lastJobTime: nonRequiredString,
})

module.exports = mongoose.model('job_states', jobsSchema)
