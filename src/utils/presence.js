const { getPrice } = require('./external')

module.exports.updatePresence = async (client) => {
  /**
   * Update the Discord rich presence status.
   */
  const presence = async () => {
    let { price, provider } = await getPrice()
    client.user.setPresence({
      status: "online",
      activity: {
        name: "Price: " + price,
        type: "WATCHING"
      }
    }).catch(console.error)
  }

  // Run it now, and run it every 5 minutes
  await presence()
  setInterval(presence, 300 * 1000)
}
