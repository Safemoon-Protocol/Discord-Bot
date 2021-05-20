/**
 * ModUtils Cog for SafeBot
 * 
 * @author Reece Benson <Simple#9999>
 * @license GPLv3
 */

const { convertIdToMember } = require("./utils/convert")

const MESSAGES = {
  WARN_MESSAGE: "You've been warned in {}",
  KICK_MESSAGE: "You've been kicked from {}",
  SOFTBAN_MESSAGE: "You've been softbanned from {}",
  BAN_MESSAGE: "You've been banned from {}"
}

class ModUtils {
  constructor(ctx) {
    this.ctx = ctx
  }

  simple(...args) {
    let reason = ''
    let previousFailed = false
    let stopLookup = false
    const members = []

    args.forEach((m) => { 
      if (stopLookup) {
        reason += m
        return
      }

      const member = convertIdToMember(this.ctx, m)
      if (!member) {
        if (previousFailed) {
          stopLookup = true
          return
        }

        previousFailed = true
        return
      }

      members.push(member)
      previousFailed = false
    })
  }
}

module.exports = ModUtils
