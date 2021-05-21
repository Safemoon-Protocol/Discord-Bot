const { didTimePassed } = require("./helper")

const getExcludedGuildsIds = (jobs) => {
  const excGuilds = []
  jobs.forEach((job) => {
    if (!job.jobState || (job.jobInterval && !didTimePassed(job.lastJobTime, job.jobInterval))) {
      excGuilds.push(job.guildId)
    }
  })
  return excGuilds
}

module.exports = {
  getExcludedGuildsIds,
}
