const mongo = require('../../../mongo')
const { secsToDHMS } = require('../../../utils/helper')
const jobSchema = require('../../../schemas/jobs')

module.exports = ({
  meta: {
    name: 'jobs',
    description: 'List all of the jobs that are available to run.',
    commands: ['jobs'],
    permissions: ['ADMINISTRATOR']
  },
  run: async (client, cache, message) => {
    await mongo().then(async (db) => {
      try {
        const jobStatus = await jobSchema.find({ guildId: message.guild.id })
        const jobFields = client.jobs.map((job) => {
          const entry = jobStatus.find((s) => s.jobName == job.meta.name)
          const status = (entry ? entry.jobState : job.meta.enabled) ? ':white_check_mark:' : ':x:'

          return {
            "name": `${status} - \`${job.meta.name}\` | ${secsToDHMS(job.meta.interval / 1000)}`,
            "value": `_${job.meta.description}_`,
            "inline": false
          }
        })

        return await message.channel.send({ embed: {
          "fields": jobFields,
          "color": 2029249,
          "timestamp": (+new Date()),
          "footer": {
            "text": "SafeMoon Bot"
          },
          "thumbnail": {
            "url": "https://i.imgur.com/cAjC1Pz.png"
          },
          "author": {
            "name": "Jobs",
            "url": "https://safemoon.net"
          }
        }})
      }
      finally {
        db.connection.close()
      }
    })
  }
})
