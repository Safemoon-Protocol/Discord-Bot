const bot = require("./bot.js");
const mongo = require('./mongo.js')
const command = require('./command')
const config = require('./config.json')
const setupSchema = require('./schemas/setup-schema')

module.exports = (client) => {
    const cache = {}

    command(client, 'pricewatch', async message => {
        const { member, channel, content, guild } = message

        if (!member.hasPermission('ADMINISTRATOR')) {
            channel.send('You do not have permission to use this command.')
            return
        }

        let text = content

        const split = text.substring(config.prefix.length + 10).split('') // pricewatch = 10 characters long.

        if (split.length < 2) {
            channel.send("Please provide the channel you'd like to link for the price watch!")
            return
        }

        split.shift()
        text = split.join('')

        cache[guild.id] = [channel.id, text]

        await mongo().then(async mongoose => {
            try {
                await setupSchema.findOneAndUpdate({
                    _id: guild.id
                }, {
                    _id: guild.id,
                    channelId: channel.id,
                    text,
                }, {
                    upsert: true
                })

            } finally {
                mongoose.connection.close()
            }
        })

        let data = cache[guild.id]

        if (!data) {
            console.log('Fetch from the database')

            await mongo().then(async (mongoose) => {
                try {
                    const result = await setupSchema.findOne({ _id: guild.id })

                    cache[guild.id] = data = [result.channelId, result.text]
                } finally {
                    mongoose.connection.close()
                }
            })
        }

        const channelId = data[0]
        console.log("channel id: " + channelId)

        setInterval(() => bot.postPrice(channelId), 20 * 1000)
        setInterval(() => bot.postEmbeded(channelId), 300 * 1000)
    })

}