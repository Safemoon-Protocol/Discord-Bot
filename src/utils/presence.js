const { getPrice } = require('./external')

module.exports.updatePresence = async (client) => {
  let { price } = await getPrice()
  client.user.setPresence({
    status: "online",
    activity: {
      name: `Price: ${price}`,
      type: "WATCHING"
    }
  }).catch(console.error)
}
