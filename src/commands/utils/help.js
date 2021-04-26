const { prefix } = require('../../config.json')

module.exports = ({
  meta: {
    name: 'help',
    description: 'Get a list of commands for the bot.',
    commands: ['help'],
    cooldownTime: 120
  },
  cache: {},
  run: async (client, cache, message) => {
    const commands = {}
    
    client.commands.forEach((cmd, k) => {
      const { category } = cmd.meta
      if (!Object.keys(commands).includes(category)) {
        commands[category] = []
      }

      // Check user has permission to run them
      const userCanRun = cmd.meta.permissions.every((perm) => message.member.hasPermission(perm))
      if (!userCanRun) return

      // Add our command to the category if the user has permission
      commands[category].push(`**${prefix}${k}**: ${cmd.meta.description}`)
    })
    
    // Flatten commands by category
    let embedText = ''
    Object.keys(commands).forEach((category) => {
      if (commands[category].length === 0) {
        // Skip categories with no commands in them
        return
      }

      embedText += `:point_right: **${category}**\n${commands[category].join('\n')}\n\n`
    })

    return await message.channel.send({
      embed: {
        "description": `The commands below are available to use by members of this guild.\n\n${embedText}`,
        "color": 2029249,
        "timestamp": (+new Date()),
        "footer": {
          "text": "SafeMoon Bot"
        },
        "thumbnail": {
          "url": "https://i.imgur.com/cAjC1Pz.png"
        },
        "author": {
          "name": "Help | SafeMoon Bot",
          "url": "https://safemoon.net"
        }
      }
    })
  }
})
