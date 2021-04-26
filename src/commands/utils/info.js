const axios = require('axios').default

module.exports = ({
  meta: {
    name: 'info',
    description: 'Get information about this bot.',
    commands: ['info'],
    cooldownTime: 120
  },
  cache: {
    contributors: '(unable to fetch contributors)'
  },
  run: async (client, cache, message) => {
    if (cache.contributors === '(unable to fetch contributors)') {
      // Fetch contributors
      const contributors = await axios.get('https://api.github.com/repos/safemoon-protocol/discord-bot/contributors')
      const users = contributors.data.map((contributor) => [contributor.login, contributor.contributions])

      // Sort
      users.sort((a, b) => b[1] - a[1])
      cache.contributors = users.map((u) => `[${u[0]}](https://github.com/${u[0]}) (${u[1]})`).join(', ')
    }

    return await message.channel.send({
      embed: {
        "description": `This bot has been put together by the :sparkles: amazing :sparkles: contributors on the [SafeMoon GitHub](https://github.com/safemoon-protocol/discord-bot).\n\nThank you to ${cache.contributors} for their support with the bot.`,
        "color": 2029249,
        "timestamp": (+new Date()),
        "footer": {
          "text": "SafeMoon Bot"
        },
        "thumbnail": {
          "url": "https://i.imgur.com/cAjC1Pz.png"
        },
        "author": {
          "name": "Information | SafeMoon Bot",
          "url": "https://safemoon.net"
        }
      }
    })
  }
})
