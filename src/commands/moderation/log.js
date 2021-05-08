const mongo = require('../../mongo')
const loggingSchema = require('../../schemas/logging')
const Canvas = require('canvas')
const { prefix } = require('../../config.json')
const { MessageAttachment } = require('discord.js')
const { wrapText, capitalize } = require('../../utils')
const pixelWidth = require('string-pixel-width')
const { processCmd } = require('../../utils/helper')

module.exports = ({
  meta: {
    name: 'log',
    description: "Capture a user's message for logging purposes",
    commands: ['log', 'l'],
    permissions: ['ADMINISTRATOR', 'MANAGE_MESSAGES'],
    cooldownTime: 0
  },
  cache: {
    logTypes: ['warn', 'kick', 'ban']
  },
  run: async (client, cache, message) => {
    // Check if the modlog channel is set
    const db = await mongo()
    const logChannel = await loggingSchema.findOne({ guildId: message.guild.id, logType: 'mod' })
    if (!logChannel) {
      if (message.member.hasPermission("ADMINISTRATOR")) {
        return await message.lineReply(`Please set your logging channel first using: \`!setlog mod #channel\``)
      }
      return await message.lineReply(`Please ask an Administrator to set up the logging channels via \`!setlog\`.`)
    }
    db.connection.close()

    // Check if the channel actually exists
    // TODO: why the hell doesn't this work? api dumb, d.py masterrace
    const postChannel = await message.guild.channels.get(logChannel.channelId)
    if (!postChannel) {
      return await message.lineReply(`The log channel set for moderation logs is invalid (<@${logChannel.channelId}>). Please set it up again via \`!setlog\`.`)
    }

    const { args } = processCmd(message)
    const logType = (args.shift() || '').toLowerCase()
    const deleteOnLog = args.map((v) => v.toLowerCase()).includes('--del')
    const reason = args.filter((v) => !['--del'].includes(v)).join(" ")

    // Validation
    if (logType === '' || !logType) {
      return await message.lineReply(`Please specify a log type. Usage: \`${prefix}log <warn/kick/ban> [reason] [--del]\``)
    }

    if (!cache.logTypes.includes(logType)) {
      return await message.lineReply('Invalid log type, use `warn`, `kick` or `ban`.')
    }

    try {
      const repliedTo = await message.channel.messages.fetch(message.reference.messageID)

      if (repliedTo.author.bot) {
        return await message.lineReply('Cannot action logs on bot messages.')
      }

      const originalMessage = pixelWidth(repliedTo.content, { size: 11 })
      const newLineCount = Math.ceil(originalMessage / 300)
      const matches = repliedTo.content.split("\n").length * 14
      const canvas = Canvas.createCanvas(600, 70 + newLineCount * 18 + matches)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#2C2F33' // Discord Dark
      ctx.fillRect(0, 0, 600 + matches, 70 + newLineCount * 18 + matches)

      // Profile Picture
      const pfp = await Canvas.loadImage(repliedTo.member.user.displayAvatarURL({ format: 'png', size: 32 }))
      ctx.drawImage(pfp, 10, 10)

      // Name
      ctx.fillStyle = '#FFF' // White
      ctx.font = '14px sans-serif'
      ctx.fillText(`${repliedTo.member.user.tag} (${repliedTo.member.user.id})`, pfp.width + 20, pfp.height - 8)

      // Date
      const date = (new Date()).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ")
      const timeZone = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1].split(" ")[0]
      ctx.fillStyle = '#DDD' // Greyish
      ctx.font = '12px sans-serif'
      ctx.fillText(`${date} (${timeZone})`, pfp.width + 20, pfp.height + 8)

      // Line
      ctx.fillRect(10, pfp.height + 19, 580, 1)

      // User Text
      wrapText(ctx, repliedTo.content, 10, pfp.height + 40, 570, 20)

      // See if the user posted an image
      let attachments = [new MessageAttachment(canvas.toBuffer()), ...repliedTo.attachments.map((a) => a)]
      let logMsg = `**User:** ${repliedTo.member.user.tag} (\`${repliedTo.member.user.id}\`, <@!${repliedTo.member.user.id}>)\n**Moderator:** ${message.member.user.tag} (\`${message.member.user.id}\`, <@!${message.member.user.id}>)\n**Punishment:** ${capitalize(logType)}\n**Reason:** ${reason || 'N/A'}\n**Includes:** ${attachments.length} attachments`

      // See if the user has embeds
      let embeds = [...repliedTo.embeds]
      if (embeds.length > 0) {
        logMsg += `\n**Embeds:**\n\`\`\`\n${embeds.map((e) => e.url).join('\n')}\n\`\`\``
      }

      await Promise.all([
        message.react('✅'),
        postChannel.send(logMsg, { files: attachments, embeds: embeds })
      ])

      // Are we deleting?
      if (deleteOnLog) {
        await message.delete()
      }
    }
    catch (e) {
      console.log(e)
      await message.lineReply('Please only use this command when replying to a message.')
    }
  }
})
