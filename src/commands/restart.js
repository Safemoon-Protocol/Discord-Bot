const { processCmd } = require('../utils/helper')

module.exports = ({
  meta: {
    name: 'restart',
    description: 'Restart the bot',
    commands: ['restart', 'rv'],
    permissions: ['MANAGE_MESSAGES'],
    guilds: ['834574811186331720', '819206127979069460']
  },
  run: async (client, cache, message) => {
    if (![
      '166705872473423872', // Simple
      '191998680696356864', // Hank
      '95581064222736384',  // Ragnar
      '150486701695827968', // Fox
      '481473497604947970', // Cole
    ].includes(message.author.id)) return await message.react('❌')
    await message.react('✅')
    console.warn(`[RESTART]: Bot restarted by ${message.author.tag} (${message.author.id})\n\n`)
    process.exit()
  }
})
