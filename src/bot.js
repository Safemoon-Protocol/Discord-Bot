const { Client } = require('discord.js')
const { updatePresence } = require('./utils/presence')
const loadCommands = require('./command')
const config = require('./config.json')
const { timeNow } = require('./utils/helper')
const { passedCooldown, setCommandCooldown } = require('./utils/cooldown')

// Create our bot client
const client = new Client()

/**
 * Bot is ready
 */
client.on('ready', async () => {
  console.log(client.user.tag + ' has logged in.')

  // Update Presence (and start interval)
  await updatePresence(client)
  
  // Load commands
  await loadCommands(client)
});

/**
 * Message handling
 */
client.on('message', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return
  
  // Ignore all messages that don't start with our prefix
  if (!message.content.startsWith(config.prefix)) return

  // Attempt to handle the command
  const { commands } = client
  const args = message.content.slice(config.prefix.length).trim().split(/ +/)
  const command = args.shift().toLowerCase()
  const run = commands.find((cmd) => cmd.meta.commands.includes(command))
  if (run) {
    // Check to see if the user running this command has
    // all of the required permissions to run it
    let userCanRun = run.meta.permissions.every((perm) => message.member.hasPermission(perm))
    if (!userCanRun) {
      return await message.channel.send(`:x: You do not have permission to run the "${config.prefix}${command}" command.`)
    }

    // Don't run the command if we're in a cooldown for this channel
    if (!passedCooldown(run, message)) {
      return console.warn('Not running', run.meta.name, 'due to cooldown')
    }

    // Cooldown passed, execute command
    console.log('Running command:', run.meta.name)
    await setCommandCooldown(run, message.channel.id)
    await run.run(client, run.cache, message, run)
  }
})

// Login
client.login(config.token)
