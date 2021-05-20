const mongoose = require('mongoose')
const { requiredString, requiredBool } = require('.')

const jobsSchema = mongoose.Schema({
  guildId: requiredString,
  jobName: requiredString,
  jobState: requiredBool
})

module.exports = mongoose.model('job_states', jobsSchema)
