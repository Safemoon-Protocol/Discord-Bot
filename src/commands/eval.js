const { processCmd, timeNow } = require('../utils/helper')

const cleanEval = (text) => (typeof(text) === 'string')
  ? text.replace(/`/g, "`" + String.fromCharCode(8203).replace(/@/g, "@" + String.fromCharCode(8203)))
  : text;

module.exports = ({
  meta: {
    name: 'eval',
    description: 'Evaluate some JS within the bot',
    commands: ['eval']
  },
  cache: {
    permittedUsers: [
      '166705872473423872', // Simple
      '191998680696356864', // Hank
    ]
  },
  run: async (client, cache, message) => {
    const { args } = processCmd(message)

    // Only allow permitted users to run this command
    if (!cache.permittedUsers.includes(message.author.id)) {
      return
    }

    // Handle our eval
    let embed = {
      "title": "**JS Evaluation**",
      "description": "⚙ Processing...",
      "color": 2029249,
      "timestamp": new Date()
    }

    await message.channel.send({ embed }).then(async (m) => {
      try {
        const code = args.join(' ')
        let evaled = await eval(code)

        if (typeof evaled !== "string") {
          evaled = require('util').inspect(evaled)
        }

        // Check if the output is above the Discord max character limit
        let url = ""
        if ((evaled.length + code.length) > 1600) {
          // TODO: hastebin br0k3
          // await hastebin.createPaste(evaled, {
          //   raw: true,
          //   contentType: 'application/json',
          //   server: 'https://hastebin.com'
          // }).then((r) => { url = r }).catch(console.error)
          evaled = evaled.substr(0, 1600)
        }

        // Update embed
        const sentTime = m.createdTimestamp / 1000
        let executionTime = (timeNow() - sentTime).toFixed(8)
        if (executionTime < 0) {
          executionTime = 0
        }

        if (code.startsWith('console.log') && evaled === 'undefined') {
          evaled = "< data sent to console >"
        }

        const cleanCode = cleanEval(evaled)
        const result = cleanCode.length >= 1600
                      ? `**Result:**:\n\`\`\`js\n${cleanCode.substr(0, cleanCode.length / 2)}\n...(trimmed)\n\`\`\``
                      : `**Result:**:\n\`\`\`js\n${cleanCode}\n\`\`\``
        const execution = `**Execution Time:** ${executionTime} seconds`
        const hastebinLink = (url === "" ? '' : `**Hastebin:**: [Click Here](${url})`)
        embed.description = [result, execution, hastebinLink].join('\n')
        await m.edit({ embed }).catch((e) => {
          m.edit(`:x: Something went wrong:\n\`\`\`\n${e}\n\`\`\``)
        })
      }
      catch (e) {
        embed.description = `:x: There was an error processing your eval.\n\`\`\`\n${e}\n\`\`\``
        await m.edit({ embed })
      }
    })
  }
})
