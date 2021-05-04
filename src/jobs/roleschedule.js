const mongo = require('../mongo')
const roleScheduleSchema = require('../schemas/role-schedule')
const { timeNow } = require('../utils/helper')

module.exports = ({
  meta: {
    name: 'role-schedule',
    interval: ((60 * 60) * 6) * 1000, // 6 hours
    enabled: true
  },
  run: async (client, cache) => {
    await mongo().then(async (db) => {
      try {
        const schedules = await roleScheduleSchema.find({})

        // Are we sharding?
        if (client.shard) {
          console.log(`[ROLESCHEDULE]: Not implemented for sharded clients.`)
        }
        else {
          // TODO
          const guildIds = client.guilds.cache.map((g) => g.id)
          schedules
            .filter((g) => guildIds.includes(g.guildId))
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

                  // Check to see if their Discord user is older than the specified time
                  const { createdTimestamp } = m.user
                  if ((timeNow() - Math.floor(createdTimestamp / 1000)) > entry.minimumLifeOnDiscord) return

                  // Check to see if they have been in this guild for a long enough time
                  const { joinedTimestamp } = m
                  if ((timeNow() - Math.floor(joinedTimestamp / 1000)) > entry.minimumLifeInGuild) return

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
        console.warn(`[ROLESCHEDULE]: somethin fucked up: ${e}`)
      }
      finally {
        db.connection.close()
      }
    })
  }
})
