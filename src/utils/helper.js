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

const isNumber = (str) => /\d+/.test(str)

const secsToDHMS = (seconds) => {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24))
  var h = Math.floor(seconds % (3600 * 24) / 3600)
  var m = Math.floor(seconds % 3600 / 60)
  var s = Math.floor(seconds % 60)
  return `${d}d, ${h}h, ${m}m, ${s}s`
}

module.exports = {
  processCmd,
  timeNow,
  isNumber,
  secsToDHMS
}
