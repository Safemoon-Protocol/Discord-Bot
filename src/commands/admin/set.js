const { processCmd } = require('../../utils/helper')
const loggingSchema = require('../../schemas/logging')
const mongo = require('../../mongo')

module.exports = ({
  meta: {
    name: 'setlog',
    description: 'Set a logging channel',
    commands: ['setlog'],
    permissions: ['ADMINISTRATOR'],
  },
  cache: {
    logTypes: ['mod', 'notes', 'bot', 'filter', 'abuse', 'auto']
  },
  run: async (client, cache, message) => {
    const { args } = processCmd(message)
    const type = args.shift() || null
    const channel = message.mentions.channels.first() || null

    if (!type) {
      return await message.lineReply('Please specify a log channel type, usage: `!setlog <type> <#channel>`')
    }

    if (!cache.logTypes.includes(type.toLowerCase())) {
      return await message.lineReply('Invalid log channel type, available choices: ' + cache.logTypes.map((t) => `\`${t}\``).join(', '))
    }

    if (!channel) {
      return await message.lineReply(`Please mention a channel to set as the \`${type}\` channel.`)
    }

    await mongo().then(async (db) => {
      try {
        await loggingSchema.findOneAndUpdate({
          guildId: message.guild.id,
          logType: type.toLowerCase()
        }, {
          guildId: message.guild.id,
          logType: type.toLowerCase(),
          channelId: channel.id
        }, {
          upsert: true
        }).then(async () => {
          return await message.lineReply(`:white_check_mark: Successfully set the \`${type}\` channel to ${channel}!`)
        }).catch(async (e) => {
          console.log(e)
          return await message.lineReply(`:x: Failed to set the \`${type}\` channel, please try again!`)
        })
      }
      finally {
        db.connection.close()
      }
    })
  }
})
