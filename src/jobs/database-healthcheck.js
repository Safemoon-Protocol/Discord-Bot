const getDb = require('../managers/database')

module.exports = ({
  meta: {
    name: 'healthcheck-db',
    description: 'Ensures that a connection to the database is available',
    interval: 5 * 1000,
    guildControlled: false,
    enabled: true
  },
  run: async (client, cache) => {
    // Check if the database connection is alive
    if (client.db.connection.readyState) return

    // Reconnect if the database connection has been dropped
    try {
      client.db.connection.close()
    }
    finally {
      client.db = await getDb()
    }
  }
})
