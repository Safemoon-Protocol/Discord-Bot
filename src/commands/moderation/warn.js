const { processCmd } = require('../../utils/helper')

module.exports = ({
  meta: {
    name: 'warn',
    description: 'Warn a user',
    commands: ['warn', 'w', 'wnote', 'wsimple', 'wkick', 'wwarn', 'wban'],
    permissions: ['ADMINISTRATOR', 'MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
    cooldownTime: 0
  },
  cache: {
    logTypes: ['note', 'simple', 'warn', 'kick', 'ban']
  },
  run: async (client, cache, message) => {
    const { command, args } = processCmd(message)
    const warnType = ((cmd) => {
      switch (cmd) {
        case 'wnote': return 'note'
        case 'wsimple': return 'simple'
        case 'wwarn': return 'warn'
        case 'wkick': return 'kick'
        case 'wban': return 'ban'
        default: return null
      }
    })(command) || args.shift().toLowerCase()

    // Check we have a valid type of warn
    if (!cache.logTypes.includes(warnType)) {
      return await message.lineReply(`Unknown warn type: "${warnType}". Warning types: ${cache.logTypes.join(', ')}.`)
    }

    // Actions
    switch (warnType) {
      case 'note': {
        return await message.lineReply('Note')
      }
      break

      case 'simple':
      case 'warn': {
        return await message.lineReply('Simple/Warn')
      }
      break

      case 'kick': {
        if (!message.member.hasPermission('KICK_MEMBERS')) {
          return await message.lineReply('You do not have permission to do this.')
        }

        return await message.lineReply('Kick')
      }
      break

      case 'ban': {
        if (!message.member.hasPermission('BAN_MEMBERS')) {
          return await message.lineReply('You do not have permission to do this.')
        }

        return await message.lineReply('Ban')
      }
      break

      default: {
        return await message.lineReply(`Unable to process warn type ${warnType}. Please try again.`)
      }
    }
  }
})
