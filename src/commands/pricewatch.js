const mongo = require('../mongo')
const setupSchema = require('../schemas/setup-schema')
const { processCmd } = require('../utils/helper')
const { resetCooldown } = require('../utils/cooldown')
const { postEmbeded } = require('../utils/prices')

module.exports = ({
  meta: {
    name: 'pricewatch',
    description: 'Set up the price watcher for SafeMoon',
    commands: ['pricewatch', 'pw'],
    cooldownTime: 30,
    permissions: ['ADMINISTRATOR']
  },
  cache: {
    watchChannels: {}
  },
  run: async (client, cache, message, _command) => {
    const { args } = processCmd(message)
    const { channel, guild } = message
    const targetChannel = message.mentions.channels.first()

    // Make sure we've referenced a channel
    if (!targetChannel) {
      resetCooldown(_command, message)
      return await channel.send("Please provide a channel you'd like to link for the price watch!")
    }

    cache.watchChannels[guild.id] = [channel.id, targetChannel.id]
    await mongo().then(async mongoose => {
      try {
        await setupSchema.findOneAndUpdate({
          _id: guild.id
        }, {
          _id: guild.id,
          channelId: channel.id,
          text: targetChannel.id,
        }, {
          upsert: true
        })
      } finally {
        mongoose.connection.close()
      }
    })

    let data = cache.watchChannels[guild.id]

    if (!data) {
      console.log('Fetch from the database')

      await mongo().then(async (mongoose) => {
        try {
          const result = await setupSchema.findOne({ _id: guild.id })
          cache.watchChannels[guild.id] = data = [result.channelId, result.text]
        } finally {
          mongoose.connection.close()
        }
      })
    }

    const channelId = data[0]
    postEmbeded(client, channelId)
    setInterval(() => postEmbeded(client, channelId), 300 * 1000)
  }
})
