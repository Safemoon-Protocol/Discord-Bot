const { prefix } = require('./config.json')

module.exports = (client, commands, callback) => {
    if (typeof commands === 'string') {
        commands = [commands]
    }

    client.on('message', (message) => {
        const { content } = message

        commands.forEach((name) => {
            const command = `${prefix}${name}`

            if (content.startsWith(`${command} `) || content === command) {
                console.log(`Running the command ${command}`)
                callback(message)
            }
        })
    })
}