const mongo = require('../mongo')
const roleScheduleSchema = require('../schemas/role-schedule')
const { processCmd, isNumber, secsToDHMS } = require('../utils/helper')
const { prefix } = require('../config.json')
const moment = require('moment')

module.exports = ({
  meta: {
    name: 'roleview',
    description: 'Schedule a role for users within a guild',
    commands: ['roleview', 'rv'],
    guilds: ['834574811186331720', '819206127979069460']
  },
  run: async (client, cache, message) => {
    const { command, args } = processCmd(message)
    const { guild } = message

    // Argument parsing
    const roleId = message.mentions.roles.first() || args.shift()

    // Validate arguments
    if (!roleId) {
      return await message.reply(`:x: Command usage: \`${prefix}${command} <roleId>\``)
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

    // Get the scheduled role
    await mongo().then(async mongoose => {
      // Check if a roleschedule has already been setup for the specified args
      let scheduled = await roleScheduleSchema.findOne({ guildId: guild.id, roleId });
      if (!scheduled) {
        mongoose.connection.close()
        return await message.reply(`:x: A role schedule for \`${roleId}\` does not exist.`)
      }

      await message.reply({ embed: {
        "title": "**Scheduled Role: View**",
        "description": `**Guild ID:** ${guild.id}\n**Role ID:** ${roleId}\n**Required length in guild:** ${secsToDHMS(scheduled.minimumLifeInGuild)}\n**Required length on Discord:** ${secsToDHMS(scheduled.minimumLifeOnDiscord)}`,
        "color": 2029249,
        "timestamp": new Date()
      }})
      mongoose.connection.close()
    })
  }
})
