const { getDexPrice } = require('../../utils/external')
const { timeNow } = require('../../utils/helper')

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
    currentPrice: NaN,
    provider: 'unknown'
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
      const { price, provider } = await getDexPrice()
      cache.cacheExpiry = timeNow() + cache.cacheTime
      cache.previousPrice = isNaN(cache.currentPrice) ? price : cache.currentPrice
      cache.currentPrice = price
      cache.provider = provider
    }

    // Return the price
    const { previousPrice, currentPrice } = cache
    const GreenSafu = client.emojis.cache.get('828471113754869770') || ':green_circle:'
    const RedSafu = client.emojis.cache.get('828471096734908467') || ':red_circle:'
    const emoji = currentPrice > previousPrice ? GreenSafu : RedSafu
    await message.channel.send(`${emoji} **${currentPrice}** _(${cache.provider})_`)
    cache.previousPrice = currentPrice
  }
})
