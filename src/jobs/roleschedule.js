const roleScheduleSchema = require('../schemas/role-schedule')
const jobSchema = require('../schemas/jobs')
const { timeNow } = require('../utils/helper')
const { getExcludedGuildsIds } = require('../utils/jobs')

module.exports = ({
  meta: {
    name: 'role-schedule',
    description: 'Checks to see if users match a guilds criteria for a scheduled role',
    interval: ((60 * 60) * 3) * 1000, // 3 hours
    guildControlled: true,
    enabled: false
  },
  run: async (client, cache) => {
    try {
      const schedules = await roleScheduleSchema.find({})

      // Are we sharding?
      if (client.shard) {
        // Find guilds that are excluded from this job
        const jobs = await jobSchema.find({ jobName: 'role-schedule' })
        const excludedGuilds = JSON.stringify(getExcludedGuildsIds(jobs))

        await client.shard.broadcastEval(`
          (async () => {
            const excludedGuilds = JSON.parse(\`${excludedGuilds}\`)
            const timeNow = () => Math.floor(+new Date() / 1000)

            // Parse in scheduled JSON package
            const guildIds = this.guilds.cache.map((g) => g.id)
            const schedules = JSON.parse(\`${JSON.stringify(schedules)}\`)
            const p = schedules
              .filter((g) => guildIds.includes(g.guildId) && !excludedGuilds.includes(g.guildId))
              .map(async (entry) => {
                let breaker = 0
                const guild = await this.guilds.fetch(entry.guildId)
                const members = await guild.members.fetch()
                const membersWithoutRole = members.filter((m) => !m._roles.includes(entry.roleId))
                const promises = membersWithoutRole.map(async (m) => {
                  try {
                    // Add a delay to avoid API abuse
                    if (breaker > 25) {
                      await new Promise((r) => setTimeout(r, 3000))
                      breaker = 0
                    }

                    const joinedTimestamp = Math.floor(m.joinedTimestamp / 1000)
                    const createdTimestamp = Math.floor(m.user.createdTimestamp / 1000)
                    const timeLeftGuild = (joinedTimestamp - timeNow()) + entry.minimumLifeInGuild
                    const timeLeftDiscord = (createdTimestamp - timeNow()) + entry.minimumLifeOnDiscord

                    // Check to see if their Discord user is older than the specified time
                    if (timeLeftDiscord > 0) return

                    // Check to see if they have been in this guild for a long enough time
                    if (timeLeftGuild > 0) return

                    m.roles.add(entry.roleId)
                    console.log('[ROLESCHEDULE]: Added Role ' + entry.roleId + ') to ' + m.id)
                    breaker++
                  } catch (e) {
                    console.log('[ROLESCHEDULE]: Exception: ' + e)
                  }
                })
                const results = await Promise.all(promises)
              })
            await Promise.all(p)
          })()
        `)
      }
      else {
        // Find guilds that are excluded from this job
        const jobs = await jobSchema.find({ jobName: 'role-schedule' })
        const excludedGuilds = JSON.stringify(getExcludedGuildsIds(jobs))

        const guildIds = client.guilds.cache.map((g) => g.id)
        schedules
          .filter((g) => guildIds.includes(g.guildId) && !excludedGuilds.includes(g.guildId))
          .map(async (entry) => {
            let breaker = 0
            const guild = await client.guilds.fetch(entry.guildId)
            const members = await guild.members.fetch()
            const membersWithoutRole = members.filter((m) => !m._roles.includes(entry.roleId))
            membersWithoutRole.map(async (m) => {
              try {
                // Add a delay to avoid API abuse
                if (breaker > 25) {
                  await new Promise((r) => setTimeout(r, 3000))
                  breaker = 0
                }

                const joinedTimestamp = Math.floor(m.joinedTimestamp / 1000)
                const createdTimestamp = Math.floor(m.user.createdTimestamp / 1000)
                const timeLeftGuild = (joinedTimestamp - timeNow()) + entry.minimumLifeInGuild
                const timeLeftDiscord = (createdTimestamp - timeNow()) + entry.minimumLifeOnDiscord

                // Check to see if their Discord user is older than the specified time
                if (timeLeftDiscord > 0) return

                // Check to see if they have been in this guild for a long enough time
                if (timeLeftGuild > 0) return

                m.roles.add(entry.roleId)
                console.log(`[ROLESCHEDULE]: Added Role (${entry.roleId}) to ${m.id}`)
                breaker++
              } catch (e) {
                console.warn(`[ROLESCHEDULE]: Error hit:\n${e}`)
              }
            })
          })
      }
    }
    catch (e) {
      console.warn(`[ROLESCHEDULE]: Something went wrong whilst trying to run the role scheduler: ${e}`)
    }
  }
})
