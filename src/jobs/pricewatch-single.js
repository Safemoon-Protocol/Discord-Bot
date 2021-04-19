const mongo = require('../mongo')
const setupSchema = require('../schemas/setup-schema')
const { getDexPrice } = require('../utils/external')
const { timeNow } = require('../utils/helper')

module.exports = ({
  meta: {
    name: 'price-watch-single-job',
    interval: 10 * 1000
  },
  cache: {
    cacheTime: 15,
    cacheExpiry: timeNow(),
    previousPrice: NaN,
    currentPrice: NaN,
    provider: 'unknown'
  },
  run: async (client, cache) => {
    await mongo().then(async (db) => {
      try {
        const guilds = await setupSchema.find({})
        
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
        const emoji = currentPrice > previousPrice ? "<:GreenSafu:828471113754869770>" : "<:RedSafu:828471096734908467>"
        const priceMessage = `${emoji} ${currentPrice} _(${cache.provider})_`

        // Are we sharding?
        if (client.shard) {
          // Find guilds associated to each shard
          const shardedGuildIds = await client.shard.broadcastEval(`this.guilds.cache.map((g) => g.id)`)
          shardedGuildIds.forEach(async (guildIds, shardId) => {
            const watchingGuilds = guildIds.filter((dbId) => guildIds.includes(dbId))
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

                  await channel.send(\`${priceMessage}\`)
                })
              })()
            `)
          })
        }
        else {
          // Get all guilds
          const guildIds = client.guilds.cache.map((g) => g.id)
          const watchingGuilds = guildIds.filter((dbId) => guildIds.includes(dbId))
          watchingGuilds.forEach(async (guildId) => {
            const guildRow = guilds.find((g) => g._id === guildId)
            if (!guildRow) return

            const guild = client.guilds.cache.get(guildId)
            if (!guild) return

            const channel = await guild.channels.cache.get(guildRow.channelId)
            if (!channel) return

            await channel.send(priceMessage)
          })
        }
      }
      finally {
        db.connection.close()
      }
    })
  }
})