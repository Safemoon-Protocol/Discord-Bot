const { getPrice } = require('../utils/external')
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
      cache.cacheExpiry = timeNow() + cache.cacheTime
      cache.previousPrice = await getPrice()

      if (isNaN(cache.currentPrice)) {
        cache.currentPrice = cache.previousPrice
      }
    }

    // Return the price
    const { previousPrice, currentPrice } = cache
    let emoji = currentPrice > previousPrice ? "<:GreenSafu:828471113754869770>" : "<:RedSafu:828471096734908467>"
    await message.channel.send(emoji + " " + price)
    cache.previousPrice = price
  }
})
