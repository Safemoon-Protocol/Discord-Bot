const { getDexPrice } = require('../utils/external')
const { timeNow } = require('../utils/helper')

module.exports = ({
  meta: {
    name: 'price',
    description: 'View the current price of SafeMoon',
    commands: ['price', 'p'],
    cooldownTime: 15
  },
  cache: {
    cacheTime: 30,
    cacheExpiry: timeNow(),
    previousPrice: NaN,
    currentPrice: NaN
  },
  run: async (client, cache, message) => {
    // To avoid spamming the API, this command has a cache
    // so that we just print the same result if we've already
    // recently retrieved the latest price
    if (
      isNaN(cache.previousPrice) ||
      isNaN(cache.currentPrice) ||
      cache.cacheExpiry <= timeNow()
    ) {
      const getCurrentPrice = await getDexPrice()
      cache.cacheExpiry = timeNow() + cache.cacheTime
      cache.previousPrice = isNaN(cache.currentPrice) ? getCurrentPrice : cache.currentPrice
      cache.currentPrice = getCurrentPrice
    }

    // Return the price
    const { previousPrice, currentPrice } = cache
    const emoji = currentPrice > previousPrice ? "<:GreenSafu:828471113754869770>" : "<:RedSafu:828471096734908467>"
    await message.channel.send(`${emoji} ${currentPrice}`)
    cache.previousPrice = currentPrice
  }
})
