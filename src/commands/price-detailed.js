const { fetchPriceEmbed } = require('../utils/prices')

module.exports = ({
  meta: {
    name: 'price-detailed',
    description: 'View the current price of SafeMoon as an embed',
    commands: ['price-detailed', 'pd'],
    cooldownTime: 60
  },
  run: async (client, cache, message) => {
    await message.channel.send(await fetchPriceEmbed(client))
  }
})
