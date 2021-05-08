const { secsToDHMS } = require('../../../utils/helper')

module.exports = ({
  meta: {
    name: 'jobs',
    description: 'List all of the jobs that are available to run.',
    commands: ['jobs'],
    permissions: ['ADMINISTRATOR']
  },
  run: async (client, cache, message) => {
    const jobFields = client.jobs.map((job) => {
      return {
        "name": `\`${job.meta.name}\` | ${secsToDHMS(job.meta.interval / 1000)}`,
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
})
