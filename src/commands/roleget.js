const mongo = require('../mongo')
const roleScheduleSchema = require('../schemas/role-schedule')
const { timeNow, processCmd, secsToDHMS } = require('../utils/helper')
const { prefix } = require('../config.json')

module.exports = ({
  meta: {
    name: 'roleget',
    description: 'Check if a user is eligible for a scheduled role',
    commands: ['roleget', 'rg'],
    permissions: ['MANAGE_MESSAGES'],
    guilds: ['834574811186331720', '819206127979069460']
  },
  run: async (client, cache, message) => {
    const { command } = processCmd(message)
    const { guild } = message
    const member = message.mentions.members.first()

    // Validate arguments
    if (!member) {
      return await message.reply(`:x: Command usage: \`${prefix}${command} <member>\``)
    }

    // Get the scheduled role
    await mongo().then(async mongoose => {
      // Check if a roleschedule has already been setup for the specified args
      const roles = await roleScheduleSchema.find({ guildId: guild.id });
      if (!roles) {
        mongoose.connection.close()
        return await message.reply(`:x: This guild does not have any scheduled roles.`)
      }

      roles.forEach(async (role) => {
        const guildRole = await guild.roles.fetch(role.roleId)
        if (!guildRole) return

        const joinedTimestamp = Math.floor(member.joinedTimestamp / 1000)
        const createdTimestamp = Math.floor(member.user.createdTimestamp / 1000)
        const timeLeftGuild = secsToDHMS((joinedTimestamp - timeNow()) + role.minimumLifeInGuild)
        const timeLeftDiscord = secsToDHMS((createdTimestamp - timeNow()) + role.minimumLifeOnDiscord)

        await message.reply({ embed: {
          "title": `**Scheduled Role: ${guildRole.name}**`,
          "description": "Shown below are the details with the schedule role, and how long the tagged user has left until aquiring the role.",
          "fields": [
            {
              "name": "Scheduled Role Details",
              "value": `**Guild ID:** \`${guild.id}\`\n**Role ID:** \`${guildRole.id}\`\n**Role:** ${guildRole}`,
              "inline": true
            },
            {
              "name": "Time Left in Guild",
              "value": timeLeftGuild,
              "inline": true
            },
            {
              "name": "Time Left in Discord",
              "value": timeLeftDiscord,
              "inline": true
            },
          ],
          "color": 2029249,
          "timestamp": new Date()
        }})
      })
      mongoose.connection.close()
    })
  }
})
