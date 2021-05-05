const { processCmd } = require('../utils/helper')

module.exports = ({
  meta: {
    name: 'stopjob',
    description: 'Stops a job from executing',
    commands: ['stopjob'],
    permissions: ['MANAGE_MESSAGES'],
    guilds: ['834574811186331720', '819206127979069460']
  },
  run: async (client, cache, message) => {
    if (![
      '166705872473423872', // Simple
      '191998680696356864', // Hank
      '95581064222736384',  // Ragnar
      '150486701695827968', // Fox
      '481473497604947970', // Cole
      '821030247646494731', // JoshTheMoonMan
      '385681941594374145', // Kruelty
      '718597526915252325', // Psy
      '378359558806044683', // Ginger
    ].includes(message.author.id)) return await message.react('❌')

    const { args } = processCmd(message)
    const jobName = args.shift() || null
    if (!jobName) {
      return await message.reply('Please specify a Job name: \n```\n' + Array.from(client.jobs.keys()).join('\n') + '\n```')
    }

    if (!Array.from(client.jobs.keys()).includes(jobName)) {
      return await message.reply('Invalid Job. Valid Jobs: \n```\n' + Array.from(client.jobs.keys()).join('\n') + '\n```')
    }

    clearInterval(client.jobs.get(jobName).cache.__interval__)
    client.jobs.get(jobName).meta.enabled = false
    client.jobs.get(jobName).run = () => {
      console.log('[SESSION]: Job ' + jobName + ' has been disabled by ' + message.author.id)
    }
    await message.react('✅')
    await message.reply('Successfully disabled `' + jobName + '`')
  }
})
