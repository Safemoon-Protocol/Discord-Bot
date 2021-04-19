module.exports = ({
  meta: {
    name: 'update-presence',
    interval: 30 * 1000
  },
  run: async (client) => {
    await updatePresence(client)
  }
})
