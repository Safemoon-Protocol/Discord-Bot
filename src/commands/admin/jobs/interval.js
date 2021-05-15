const { processCmd, validateText, parseInterval, secsToDHMS, getISODate, validateTime, getInlineCodeblock  } = require('../../../utils/helper')
const jobSchema = require('../../../schemas/jobs')
const { INTERVAL_FORMAT } = require('../../../constants/constants')

module.exports = ({
  meta: {
    name: 'jobs-interval',
    description: 'Change the interval for job',
    commands: ['jobinterval'],
    permissions: ['ADMINISTRATOR']
  },
  run: async (client, cache, message) => {
      const { args } = processCmd(message)
      const { guild } = message
      const jobName = args.shift() || null
      const intervalText = args.join(' ')
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
        return await message.lineReply('Guild controlled jobs run on an interval that cannot be changed.')
      }

      if(!intervalText) {
        return await message.lineReply(`Please provide time interval in specified format: ${secsToDHMS(0)}.`)
      }

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

      try {
        // Check if the job was not enabled for this guild
        const existingJob = await jobSchema.findOne({ guildId: guild.id, jobName: job.meta.name, jobState: true })
        if (!existingJob) {
          return await message.lineReply(`The specified job (${job.meta.name}) is not enabled for this guild.`)
        }
  
        await jobSchema.findOneAndUpdate({
          guildId: guild.id,
          jobName: job.meta.name
        }, {
          jobInterval: interval,
          lastJobTime: lastJob,
        }, {
          upsert: true
        })
        return await message.reply(`Successfully changed the interval for ${getInlineCodeblock(jobName)}, this will execute on the jobs next interval.`)
      }
      catch {}

    }
})
