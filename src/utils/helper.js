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
  return `${d > 0 ? d : 0}d, ${h > 0 ? h : 0}h, ${m > 0 ? m : 0}m, ${s > 0 ? s : 0}s`
}

// validate string against regex
const validateText = (text, regex) => {
  if(!text) {
    return false
  }

  const matched = text.match(regex)
  return !!matched && matched.length > 0
}

// validate if the time is provided correctly
const validateTime = (interval) => {
  interval = interval.replace(/\s|,/g, '')
  const splitted = interval.split(/[a-z]/)
  var d = Number(splitted[0])
  var h = Number(splitted[1])
  var m = Number(splitted[2])
  var s = Number(splitted[3])

  if (
    d < 0 ||
    h < 0 ||
    m < 0 ||
    s < 0
  ) {
    return "Every number must be positive integer."
  }

  if (d > 7) {
    return "The maximum day interval is 7."
  } else if (h > 24) {
    return "You cannot provide more than 24 hours."
  } else if (m >= 60) {
    return "You cannot provide more than 59 minutes."
  } else if (s >= 60) {
    return "You cannot provide more than 59 seconds."
  }

  return ''
}

// parse interval and return miliseconds
const parseInterval = (interval) => {
  interval = interval.replace(/\s|,/g, '')
  const splitted = interval.split(/[a-z]/)
  var d = Number(splitted[0])
  var h = Number(splitted[1])
  var m = Number(splitted[2])
  var s = Number(splitted[3])

  return ((d * 24 * 3600) + (h * 3600) + (m * 60) + s) * 1000
}

const getISODate = () => {
  return new Date().toISOString()
}

const didTimePassed = (beginDate, diff) => {
  return new Date() - new Date(beginDate) >= diff * 1000
}

const getInlineCodeblock = (text) => {
  return '`' + text + '`'
}

module.exports = {
  processCmd,
  timeNow,
  isNumber,
  secsToDHMS,
  validateText,
  parseInterval,
  getISODate,
  didTimePassed,
  validateTime,
  getInlineCodeblock
}
