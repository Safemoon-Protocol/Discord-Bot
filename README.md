# SafeMoon - Discord Bot

## Requirements

- [Node.js](http://nodejs.org/)
- [Discord](https://discordapp.com/) account
- [Docker](https://get.docker.com/) _(Optional)_

## Installation Steps (if applicable)

#### Running the bot on your machine

1. Clone the [SafeMoon Discord-Bot](https://github.com/Safemoon-Protocol/Discord-Bot) repository.
2. Run `npm install`
3. Configure your `config.json` file.
4. Run `npm run start`
5. Woo. Your bot is now running!

#### Running the bot via Docker

1. Clone the [SafeMoon Discord-Bot](https://github.com/Safemoon-Protocol/Discord-Bot) repository.
2. Copy the `.env.example` file to `.env` and update the values.
    - Set `DISCORD_RUNNER` to either `local` or `shard`, depending on your criteria.
3. Copy the `config.example.json` file in the `src/` directory to `config.json` and update it to your liking.
4. Run `docker-compose up -d` in the root directory.
5. Woo. Your bot is now running!

## How to add the bot to your discord server

1. Create your bot and go to the oauth page and grab your bot client id.
2. Go to: https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID_HERE&scope=bot
3. Authorize it and you're good to go.

## How to configure your config.json file

Copy the `config.example.json` file inside of the `src/` directory, and then update it to your liking.

```json
{
  "token": "YOUR_BOT_TOKEN",
  "prefix": "default command prefix",
  "mongoPath": "mongodb://localhost:27017/discordbot",
  "contractAddress": "0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3",
  "bscScanApiKey": "YOUR_API_KEY_GOES_HERE"
}
```
