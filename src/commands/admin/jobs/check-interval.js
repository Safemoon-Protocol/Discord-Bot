const { processCmd, secsToDHMS, getInlineCodeblock } = require('../../../utils/helper')
const jobSchema = require('../../../schemas/jobs')

module.exports = ({
  meta: {
    name: 'check-interval',
    description: 'Check the interval for job',
    commands: ['checkinterval'],
    permissions: ['ADMINISTRATOR']
  },
  run: async (client, cache, message) => {
      const { args } = processCmd(message)
      const { guild } = message
      const jobName = args.shift() || null
  
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
  
      try {
        // Check if the job was not enabled for this guild
        const existingJob = await jobSchema.findOne({ guildId: guild.id, jobName: job.meta.name, jobState: true })
        if (!existingJob) {
          return await message.lineReply(`The specified job (${job.meta.name}) is not enabled for this guild.`)
        }
  
        return await message.reply(`The current interval for ${getInlineCodeblock(jobName)} is ${secsToDHMS(existingJob.jobInterval)}.`)
      }
      catch {}
    }
})
