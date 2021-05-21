const priceWatchSchema = require('../schemas/price-watch')
const jobSchema = require('../schemas/jobs')
const { getDexPrice } = require('../utils/external')
const { timeNow, getISODate } = require('../utils/helper')
const { getExcludedGuildsIds } = require('../utils/jobs')
const { DEFAULT_PRICE_WATCH_SINGLE_INTERVAL } = require('../constants/constants')

module.exports = ({
  meta: {
    name: 'price-watch-single',
    description: 'Sends a single message of the current price of SafeMoon',
    interval: 5 * 1000,
    defaultInterval: DEFAULT_PRICE_WATCH_SINGLE_INTERVAL * 1000,
    guildControlled: true,
    enabled: true
  },
  cache: {
    cacheTime: 10,
    cacheExpiry: timeNow(),
    previousPrice: NaN,
    currentPrice: NaN,
    provider: 'unknown'
  },
  run: async (client, cache) => {
    try {
      const guilds = await priceWatchSchema.find({})
      const jobName = 'price-watch-single'
      
      // To avoid spamming the API, this command has a cache
      // so that we just print the same result if we've already
      // recently retrieved the latest price
      if (
        isNaN(cache.previousPrice) ||
        isNaN(cache.currentPrice) ||
        cache.cacheExpiry <= timeNow()
      ) {
        const { price, provider } = await getDexPrice()
        cache.cacheExpiry = timeNow() + cache.cacheTime
        cache.previousPrice = isNaN(cache.currentPrice) ? price : cache.currentPrice
        cache.currentPrice = price
        cache.provider = provider
      }

      // Generate our message
      const { previousPrice, currentPrice } = cache
      const emoji = currentPrice > previousPrice ? 'GreenSafu' : 'RedSafu'
      const priceMessage = `${emoji} **${currentPrice}** _(${cache.provider})_`

      // Are we sharding?
      if (client.shard) {
        // Find guilds that are excluded from this job
        const jobs = await jobSchema.find({ jobName })
        const excludedGuilds = getExcludedGuildsIds(jobs)

        // Find guilds associated to each shard
        const shardedGuildIds = await client.shard.broadcastEval(`this.guilds.cache.map((g) => g.id)`)
        shardedGuildIds.forEach(async (guildIds, shardId) => {

          const watchingGuilds = guildIds.filter((dbId) => !excludedGuilds.includes(dbId))
          const guildsByCsv = watchingGuilds.join(',')
          const dbGuildsAndChannels = guilds.map((g) => `${g.id}/${g.channelId}`).join(',')

          await client.shard.broadcastEval(`
            (async () => {
              // Ignore shards that the Guild IDs do not relate to
              if (!this.shard.ids.includes(${shardId})) return;

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

                const GreenSafu = this.emojis.cache.get('828471113754869770') || ':green_circle:'
                const RedSafu = this.emojis.cache.get('828471096734908467') || ':red_circle:'
                const message = \`${priceMessage}\`

                await channel.send(message.replace('GreenSafu', GreenSafu).replace('RedSafu', RedSafu))
              })
            })()
          `)

          try {
            await jobSchema.updateMany(
              { 
                'guildId': { $in : watchingGuilds },
                'jobName': { $eq: jobName }
              },
              { $set: { 'lastJobTime': getISODate() } }
            )
          } catch {}
        })
      }
      else {
        // Find guilds that are excluded from this job
        const jobs = await jobSchema.find({ jobName: 'price-watch-single' })
        const excludedGuilds = getExcludedGuildsIds(jobs)

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

          const GreenSafu = client.emojis.cache.get('828471113754869770') || ':green_circle:'
          const RedSafu = client.emojis.cache.get('828471096734908467') || ':red_circle:'

          await channel.send(priceMessage.replace('GreenSafu', GreenSafu).replace('RedSafu', RedSafu))
        })

        await jobSchema.updateMany(
          { 
            'guildId': { $in : watchingGuilds },
            'jobName': { $eq: jobName }
          },
          { $set: { 'lastJobTime': getISODate() } }
        )
      }
    }
    catch (e) {
      console.warn('Caught error on Price Watch Single Job:\n', e)
    }
  }
})