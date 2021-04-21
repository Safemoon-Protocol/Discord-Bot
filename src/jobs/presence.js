const { updatePresence } = require("../utils/presence")

module.exports = ({
  meta: {
    name: 'update-presence',
    interval: 30 * 1000,
    enabled: true
  },
  run: async (client, cache) => {
    await updatePresence(client)
  }
})
