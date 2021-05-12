const getExcludedGuilds = (jobs) => {
  const excGuilds = []
  jobs.forEach((job) => {
    if (!job.jobState) {
      excGuilds.push(job.guildId);
    }

    if (
      job.jobInterval && 
      !didTimePassed(job.lastJobTime, job.jobInterval)
      ) {
      excGuilds.push(job.guildId);
    }
  })
  return excGuilds;
}

module.exports = {
  getExcludedGuilds,
}