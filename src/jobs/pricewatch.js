const mongo = require('../mongo')
const priceWatchSchema = require('../schemas/price-watch')
const { fetchPriceEmbed } = require('../utils/prices')

module.exports = ({
  meta: {
    name: 'price-watch-job',
    description: 'Sends an embed message of the current statistics of SafeMoon',
    interval: 300 * 1000,
    guildControlled: true,
    enabled: true
  },
  run: async (client, cache) => {
    await mongo().then(async (db) => {
      try {
        const guilds = await priceWatchSchema.find({})
        const priceEmbed = await fetchPriceEmbed()

        // Are we sharding?
        if (client.shard) {
          // Find guilds associated to each shard
          const shardedGuildIds = await client.shard.broadcastEval(`this.guilds.cache.map((g) => g.id)`)
          shardedGuildIds.forEach(async (guildIds, shardId) => {
            const guildsByCsv = guildIds.join(',')
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
          })
        }
        else {
          // Get all guilds
          const guildIds = client.guilds.cache.map((g) => g.id)
          guildIds.forEach(async (guildId) => {
            const guildRow = guilds.find((g) => g._id === guildId)
            if (!guildRow) return

            const guild = client.guilds.cache.get(guildId)
            if (!guild) return

            const channel = await guild.channels.cache.get(guildRow.channelId)
            if (!channel) return

            await channel.send(priceEmbed)
          })
        }
      }
      finally {
        db.connection.close()
      }
    })
  }
})
