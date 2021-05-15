const { processCmd, validateText, parseInterval, secsToDHMS, getISODate, validateTime, getInlineCodeblock  } = require('../../../utils/helper')
const jobSchema = require('../../../schemas/jobs')
const { INTERVAL_FORMAT } = require('../../../constants/constants')

module.exports = ({
  meta: {
    name: 'jobstart',
    description: 'Include this guild in a running job',
    commands: ['jobstart', 'jobs start'],
    permissions: ['ADMINISTRATOR'],
  },
  run: async (client, cache, message) => {
    const { args } = processCmd(message)
    const { guild } = message
    const jobName = args.shift() || null
    const intervalText = args.join(" ")
    let interval = null
    let lastJob = null


    if (!jobName) {
      return await message.lineReply('Please specify a Job name: \n```\n' + Array.from(client.jobs.keys()).join('\n') + '\n```')
    }

    if (!Array.from(client.jobs.keys()).includes(jobName)) {
      return await message.lineReply('Invalid Job. Valid Jobs: \n```\n' + Array.from(client.jobs.keys()).join('\n') + '\n```')
    }

    const job = client.jobs.get(jobName)
    if (!job.meta.guildControlled) {
      return await message.lineReply('Unable to enable a job that is not guild controlled.')
    }

    // user provided interval
    if (intervalText) {
      if (!validateText(intervalText, INTERVAL_FORMAT)) {
        return await message.lineReply(`Specified format is incorrect. The correct format is ${secsToDHMS(0)}.`)
      }

      const timeValidationMsg = validateTime(intervalText)
      if (timeValidationMsg !== '') {
        return await message.lineReply(timeValidationMsg)
      }

      interval = parseInterval(intervalText)
      if (job.meta.defaultInterval >= interval) {
        return await message.lineReply(`The interval cannot be lesser or equal to ${secsToDHMS(Math.floor(job.meta.defaultInterval / 1000))}.`)
      }

      interval = Math.floor(interval / 1000)
      lastJob = getISODate()

    } else if (job.meta.defaultInterval) {
      interval = Math.floor(job.meta.defaultInterval / 1000)
      lastJob = getISODate()
    }
    
    try {
      // Check if the job is already enabled
      const existingJob = await jobSchema.findOne({ guildId: guild.id, jobName: job.meta.name, jobState: true })
      if (existingJob) {
        return await message.lineReply(`The specified job (${job.meta.name}) is already enabled for this guild.`)
      }

      await jobSchema.findOneAndUpdate({
        guildId: guild.id,
        jobName: job.meta.name
      }, {
        guildId: guild.id,
        jobName: job.meta.name,
        jobInterval: interval,
        lastJobTime: lastJob,
        jobState: true
      }, {
        upsert: true
      })
      return await message.reply(`Successfully enabled ${getInlineCodeblock(jobName)}, this will execute on the jobs next interval.`)
    }
    catch {}
  }
})
