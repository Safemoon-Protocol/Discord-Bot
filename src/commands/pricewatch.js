const mongo = require('../mongo')
const setupSchema = require('../schemas/setup-schema')
const { resetCooldown } = require('../utils/cooldown')
const { fetchPriceEmbed } = require('../utils/prices')

module.exports = ({
  meta: {
    name: 'pricewatch',
    description: 'Set up the price watcher for SafeMoon',
    commands: ['pricewatch', 'pw'],
    cooldownTime: 30,
    permissions: ['ADMINISTRATOR']
  },
  run: async (client, cache, message, _command) => {
    const { channel, guild } = message
    const targetChannel = message.mentions.channels.first()

    // Make sure we've referenced a channel
    if (!targetChannel) {
      resetCooldown(_command, message)
      return await channel.send("Please provide a channel you'd like to link for the price watch!")
    }

    // Add the channel to the database
    await mongo().then(async mongoose => {
      try {
        await setupSchema.findOneAndUpdate({
          _id: guild.id
        }, {
          _id: guild.id,
          channelId: targetChannel.id,
          text: '', // TODO: Remove this column as it is not needed
        }, {
          upsert: true
        })
      } finally {
        mongoose.connection.close()
      }
    })

    await targetChannel.send(await fetchPriceEmbed(client))
    return await channel.send(`:white_check_mark: Successfully set ${targetChannel} as the SafeMoon Price Watch channel.`)
  }
})
