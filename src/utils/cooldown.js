const { timeNow } = require("./helper")

const passedCooldown = (command, message) => {
  const { cooldownTime } = command.meta
  const { cooldownExpiry } = command.cache
  const { id } = message.channel
  if (!id) return true

  // Check if this channel has a cooldown
  const expiryTime = cooldownExpiry.get(id) || null
  if (expiryTime !== null && expiryTime >= timeNow()) {
    return false
  }

  return true
}

const resetCooldown = (command, message) =>
  command.cache.cooldownExpiry.set(message.channel.id, timeNow() - 1)

const setCommandCooldown = (command, channelId) =>
  command.cache.cooldownExpiry.set(channelId, timeNow() + command.meta.cooldownTime)

module.exports = {
  passedCooldown,
  resetCooldown,
  setCommandCooldown
}
