const { DEFAULT_PRICE_WATCH_SINGLE_INTERVAL, DEFAULT_PRICE_WATCH_INTERVAL } = require('../../constants/constants')
const priceWatchSchema = require('../../schemas/price-watch')
const jobSchema = require('../../schemas/jobs')
const { resetCooldown } = require('../../utils/cooldown')
const { getISODate } = require('../../utils/helper')
const { fetchPriceEmbed } = require('../../utils/prices')

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
    try {
      await priceWatchSchema.findOneAndUpdate({
        _id: guild.id
      }, {
        _id: guild.id,
        channelId: targetChannel.id,
        text: '', // TODO: Remove this column as it is not needed
      }, {
        upsert: true
      })


      // create jobs related to to this command
      await jobSchema.findOneAndUpdate({
        guildId: guild.id,
        jobName: 'price-watch-single'
      }, {
        guildId: guild.id,
        jobName: 'price-watch-single',
        jobInterval: DEFAULT_PRICE_WATCH_SINGLE_INTERVAL,
        lastJobTime: getISODate(),
        jobState: true,
      }, {
        upsert: true
      })

      await jobSchema.findOneAndUpdate({
        guildId: guild.id,
        jobName: 'price-watch'
      }, {
        guildId: guild.id,
        jobName: 'price-watch',
        jobInterval: DEFAULT_PRICE_WATCH_INTERVAL,
        lastJobTime: getISODate(),
        jobState: true,
      }, {
        upsert: true
      })
    }
    catch(e) {
    }

    await targetChannel.send(await fetchPriceEmbed(client))
    return await channel.send(`:white_check_mark: Successfully set ${targetChannel} as the SafeMoon Price Watch channel.`)
  }
})
