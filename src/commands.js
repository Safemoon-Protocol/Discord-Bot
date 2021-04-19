const { Collection } = require('discord.js')
const fs = require('fs')
const path = require('path')

const processCommands = (client, dir, stack = "") => {
  const files = fs.readdirSync(dir)

  // Find each file within the given directory
  files.forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory())
      return processCommands(client, path.join(dir, file), stack+file + "/")
    
    // Load the command file
    const command = require(path.join(dir, file))

    // Ensure some parameters are set
    if (!command.meta.name || !command.meta.commands)
      return console.warn('Ignoring', file, 'as the meta data is invalid (requires "name" and "commands").')
    
    // Description
    if (!command.meta.description)
      command.meta.description = ''

    // Permissions
    if (!command.meta.permissions)
      command.meta.permissions = []

    // Command Cooldown
    if (!command.meta.cooldownTime)
      command.meta.cooldownTime = 0

    // Add per-command caching & cooldown logging
    command.cache = {
      ...command.cache || {},
      cooldownExpiry: new Collection()
    }

    // Add our command to our pool
    client.commands.set(command.meta.name, command)
    console.log(`[CMD]: Loaded the "${command.meta.name}" command.`)

    // Remove from require cache
    delete require.cache[require.resolve(path.join(dir, file))]
  })
}

module.exports = (client) => {
  // Create our commands set
  client.commands = new Collection()
  processCommands(client, path.join(__dirname, 'commands'))
}
