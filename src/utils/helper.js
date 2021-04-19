const { prefix } = require('../config.json')

const processCmd = (message) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/)
  const command = args.shift()
  const msg = message.content
  return {
    msg,
    command,
    args
  }
}

const timeNow = () => Math.floor(+new Date() / 1000)

module.exports = {
  processCmd,
  timeNow
}
