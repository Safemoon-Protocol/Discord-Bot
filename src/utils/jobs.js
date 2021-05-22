const { didTimePassed } = require("./helper")

const getExcludedGuildsIds = (jobs) => {
  return jobs
    .filter((job) => !job.jobState || (job.jobInterval && !didTimePassed(job.lastJobTime, job.jobInterval)))
    .map((job) => job.guildId)
}

module.exports = {
  getExcludedGuildsIds,
}
