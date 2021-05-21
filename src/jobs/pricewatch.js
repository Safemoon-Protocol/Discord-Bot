const priceWatchSchema = require('../schemas/price-watch')
const jobSchema = require('../schemas/jobs')
const { fetchPriceEmbed } = require('../utils/prices')
const { timeNow, getISODate } = require('../utils/helper');
const { getExcludedGuilds } = require('../utils/jobs')
const { DEFAULT_PRICE_WATCH_INTERVAL } = require('../constants/constants')

module.exports = ({
  meta: {
    name: 'price-watch',
    description: 'Sends an embed message of the current statistics of SafeMoon',
    interval: 60 * 1000,
    defaultInterval: DEFAULT_PRICE_WATCH_INTERVAL * 1000,
    guildControlled: true,
    enabled: true
  },
  cache: {
    cacheTime: 300 * 1000,
    cacheExpiry: timeNow(),
    priceEmbed: null,
  },
  run: async (client, cache) => {
    try {
      const guilds = await priceWatchSchema.find({})
      const jobName = 'price-watch'

      // To avoid spamming the API, this command has a cache
      // so that we just print the same result if we've already
      // recently retrieved the latest price
      if (
        !cache.data || 
        cache.cacheExpiry <= timeNow()
      ) {
        cache.priceEmbed = await fetchPriceEmbed()
        cache.cacheExpiry = timeNow() + cache.cacheTime
      }

      const { priceEmbed } = cache

      // Are we sharding?
      if (client.shard) {
        // Find guilds that are excluded from this job
        const jobs = await jobSchema.find({ jobName })
        const excludedGuilds = getExcludedGuilds(jobs)

        // Find guilds associated to each shard
        const shardedGuildIds = await client.shard.broadcastEval(`this.guilds.cache.map((g) => g.id)`)
        shardedGuildIds.forEach(async (guildIds, shardId) => {
          const watchingGuilds = guildIds.filter((dbId) => !excludedGuilds.includes(dbId))
          const guildsByCsv = watchingGuilds.join(',')
          const dbGuildsAndChannels = guilds.map((g) => `${g.id}/${g.channelId}`).join(',')
          const embedJson = JSON.stringify(priceEmbed)

          await client.shard.broadcastEval(`
            (async () => {
              // Ignore shards that the Guild IDs do not relate to
              if (!this.shard.ids.includes(${shardId})) return;

              const embed = JSON.parse(\`${embedJson}\`)
              const guildIds = "${guildsByCsv}"
              const watchingGuilds = guildIds.split(',')
              const dbGuilds = "${dbGuildsAndChannels}"
              const guilds = dbGuilds.split(',').map((t) => {
                const obj = t.split('/')
                return {
                  _id: obj[0],
                  channelId: obj[1]
                }
              })

              watchingGuilds.forEach(async (guildId) => {
                const guildRow = guilds.find((g) => g._id === guildId)
                if (!guildRow) return

                const guild = this.guilds.cache.get(guildId)
                if (!guild) return

                const channel = await guild.channels.cache.get(guildRow.channelId)
                if (!channel) return

                await channel.send(embed)
              })
            })()
          `)

          try {
            await jobSchema.updateMany(
              { 
                'guildId': { $in : watchingGuilds },
                'jobName': { $eq: jobName }
              },
              { $set: {'lastJobTime': getISODate() } }
            )
          } catch {}
        })
      }
      else {
        // Find guilds that are excluded from this job
        const jobs = await jobSchema.find({ jobName: 'price-watch' })
        const excludedGuilds = getExcludedGuilds(jobs)

        // Get all guilds
        const guildIds = client.guilds.cache.map((g) => g.id)
        const watchingGuilds = guildIds.filter((dbId) => !excludedGuilds.includes(dbId))
        watchingGuilds.forEach(async (guildId) => {
          const guildRow = guilds.find((g) => g._id === guildId)
          if (!guildRow) return

          const guild = client.guilds.cache.get(guildId)
          if (!guild) return

          const channel = await guild.channels.cache.get(guildRow.channelId)
          if (!channel) return

          await channel.send(priceEmbed)
        })

        await jobSchema.updateMany(
          { 
            'guildId': { $in : watchingGuilds },
            'jobName': { $eq: jobName }
          },
          { $set: {'lastJobTime': getISODate() } }
        )
      }
    }
    catch (e) {
      console.warn('Caught error on Price Watch Job:\n', e)
    }
  }
})
