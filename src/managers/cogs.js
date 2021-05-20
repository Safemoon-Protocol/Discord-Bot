const { Collection } = require('discord.js')
const fs = require('fs')
const path = require('path')

const processCogs = (client, dir) => {
  const files = fs.readdirSync(dir)

  // Find each file within the given directory
  files.forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      // Load the info file
      try {
        const meta = require(path.join(dir, file, 'info.json'))

        // Ensure some parameters are set
        if (!meta.name || !meta.entry)
          return console.warn('Ignoring', file, 'as the meta data is invalid (requires "name" and "entry").')

        // Instantiate the cog
        const Cog = require(path.join(dir, file, `${file}.js`))

        // Add our cog to our pool
        client.cogs.set(meta.name, new Cog(client))
        console.log(`[COG]: Loaded the "${meta.name}" cog.`)

        // Remove from require cache
        delete require.cache[require.resolve(path.join(dir, file))]
      }
      catch {}
    }
  })
}

module.exports = (client) => {
  // Create our cogs set
  client.cogs = new Collection()
  processCogs(client, path.join(__dirname, '..', 'cogs'))
}
