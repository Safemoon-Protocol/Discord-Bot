## Requirements

- [Node.js](http://nodejs.org/)
- [Discord](https://discordapp.com/) account

## Installation Steps (if applicable)

1. Clone the SafeMoon Discord-Bot repository.
2. Run `npm install`
3. Run `npm i -g nodemon` (Optional)
4. Configure your `config.json` file.
5. Run `npm run start`
6. Woo. Your bot is now running.

## How to add the bot to your discord server

1. Create your bot and go to the oauth page and grab your bot client id.
2. Go to: https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID_HERE&scope=bot
3. Authorize it and you're good to go.

## How to configure your config.json file

- Create a file called "config.json" inside your project folder. It will need to following syntax:

```
{
    "token": "YOUR_BOT_TOKEN",
    "prefix": "default command prefix",
    "mongoPath": "mongodb://localhost:27017/discordbot"
}
```