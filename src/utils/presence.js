const { getDexPrice } = require('./external')

module.exports.updatePresence = async (client) => {
  let { price } = await getDexPrice()
  client.user.setPresence({
    status: "online",
    activity: {
      name: `Price: ${price}`,
      type: "WATCHING"
    }
  }).catch(console.error)
}
