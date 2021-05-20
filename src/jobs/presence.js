const { updatePresence } = require("../utils/presence")

module.exports = ({
  meta: {
    name: 'update-presence',
    description: 'Update the presence message of the bot',
    interval: 30 * 1000,
    guildControlled: false,
    enabled: true
  },
  run: async (client, cache) => {
    await updatePresence(client)
  }
})
