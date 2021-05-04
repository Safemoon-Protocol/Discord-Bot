const mongo = require('../mongo')
const roleScheduleSchema = require('../schemas/role-schedule')
const { processCmd, isNumber } = require('../utils/helper')
const { prefix } = require('../config.json')

module.exports = ({
  meta: {
    name: 'roleschedule',
    description: 'Schedule a role for users within a guild',
    commands: ['roleschedule', 'rs'],
    guilds: ['834574811186331720', '819206127979069460']
  },
  cache: {
    defaultDiscordTime: (((60 * 60) * 24) * 28) // 4 weeks
  },
  run: async (client, cache, message) => {
    const { msg, command, args } = processCmd(message)
    const { guild } = message

    // Argument parsing
    const roleId = message.mentions.roles.first() || args.shift()
    if (Object.keys(roleId).includes('id')) args.shift() // Removes Role ID if it is a mention
    const guildTime = args.shift()
    const discordTime = args.shift() || cache.defaultDiscordTime

    // Validate arguments
    if (!roleId || !guildTime) {
      return await message.reply(`:x: Command usage: \`${prefix}${command} <roleId> <guildTime> [discordTime]\`, where \`time\` is defined in seconds.`)
    }

    // Type-check Role ID
    if (!Object.keys(roleId).includes('id') && !isNumber(roleId)) {
      return await message.reply(`:x: You have used an invalid Role ID. Please either tag the role, or use the Role ID.`)
    }
    else if (!Object.keys(roleId).includes('id') && isNumber(roleId)) {
      // Validate role exists
      if (!(await message.guild.roles.fetch(roleId))) {
        return await message.reply(`:x: There does not seem to be a role with the Role ID: \`${roleId}\`. Please double check and try again.`)
      }
    }

    // Type-check Guild & Discord Time
    if (!isNumber(guildTime) || !isNumber(discordTime)) {
      return await message.reply(`:x: Please specify \`guildTime\` or \`discordTime\` as seconds.`)
    }

    await mongo().then(async mongoose => {
      // Check if a roleschedule has already been setup for the specified args
      if (await roleScheduleSchema.findOne({ guildId: guild.id, roleId })) {
        mongoose.connection.close()
        return await message.reply(`:x: A role schedule for <@&${roleId}> has already been created. Use \`${prefix}roleview ${roleId}\` to view details.`)
      }

      // Create schema entry
      try {
        await roleScheduleSchema.findOneAndUpdate({
          guildId: guild.id,
          roleId: roleId
        }, {
          guildId: guild.id,
          roleId: roleId,
          minimumLifeInGuild: guildTime,
          minimumLifeOnDiscord: discordTime
        }, {
          upsert: true
        })
      } finally {
        mongoose.connection.close()
      }

      return message.reply(`:white_check_mark: Successfully scheduled the <@&${roleId.id || roleId}> role to be added to users after ${guildTime} seconds in this guild, and ${discordTime} seconds on Discord.`)
    })
  }
})
