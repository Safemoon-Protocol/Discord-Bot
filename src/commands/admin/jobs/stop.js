const { processCmd } = require('../../../utils/helper')
const jobSchema = require('../../../schemas/jobs')

module.exports = ({
  meta: {
    name: 'jobstop',
    description: 'Exclude this guild from a running job',
    commands: ['jobstop', 'jobs stop'],
    permissions: ['ADMINISTRATOR'],
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
      return await message.lineReply('Unable to disable a job that is not guild controlled.')
    }

    try {
      // Check if the job is already disabled
      const existingJob = await jobSchema.findOne({ guildId: guild.id, jobName: job.meta.name, jobState: false })
      if (existingJob) {
        return await message.lineReply(`The specified job (${job.meta.name}) is already disabled for this guild.`)
      }

      await jobSchema.findOneAndUpdate({
        guildId: guild.id,
        jobName: job.meta.name
      }, {
        guildId: guild.id,
        jobName: job.meta.name,
        jobState: false
      }, {
        upsert: true
      })
      return await message.reply('Successfully disabled `' + jobName + '`, this job will no longer run on the jobs interval.')
    }
    catch {}
  }
})
