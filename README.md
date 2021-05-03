<p align="center">
  <img src="https://safemoon.net/img/logov2.gif" width="64" />
  <br/>
  <h3 align="center">SafeMoon</h3>
</p>
<p align="center">
  <span align="center">Discord Bot 🚀</span>
  <br/>
  <a href ="https://safemoon.net/" target="_blank">https://safemoon.net/</a>
</p>

<p align="center">
  <a href="#about">About</a>
  •
  <a href="#commands">Commands</a>
  •
  <a href="#requirements">Requirements</a>
  •
  <a href="#installation">Installation</a>
  •
  <a href="#setup">Setup</a>
  •
  <a href="#license">License</a>
  •
  <a href="#contributors">Contributors</a>
</p>

---

## About

SafeBot is open source to allow our community to utilize, contribute and improve the experience
of the [SafeMoon Discord Server](https://discord.gg/safemoon). You can also invite SafeBot to
your own server, by [clicking here](https://discord.com/oauth2/authorize?client_id=827403996272132096&scope=bot).

Feel free to leave a ⭐ to help promote SafeMoon!

## Commands

_Substitute `!` in the below commands to be the prefix that is set in `config.json`._

| Command | Aliases | Permissions | Feature |
| ------- | ------- | ----------- | ------- |
| **!price**  | !p | - | Shows the current price of $SAFEMOON from the Dex Guru API _(falls back to Pancake if Dex fails)_ |
| **!price-detailed** | !pd | - | Show the statistics of the $SAFEMOON coin |
| **!pricewatch** | !pw | ADMINISTRATOR | Set the channel that will receive continuous updates of the $SAFEMOON statistics and price |

## Requirements

- [Node.js](http://nodejs.org/) _(v14.8.0+)_
- [NPM](https://www.npmjs.com/) _(v6.14.7+)_

If you want to run the bot within a containerised environment, this
repository is setup to use Docker.

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation

You can add SafeBot to your server by [clicking here](https://discord.com/oauth2/authorize?client_id=827403996272132096&scope=bot),
otherwise, you can clone this repository and host the bot yourself.

```bash
$ git clone https://github.com/Safemoon-Protocol/Discord-Bot.git
```

Once you've cloned the repository to your machine or server, you will need
to run the below command to grab the dependencies that the bot requires to run.

```bash
$ npm install
```

## Setup

Copy the `config.example.json` file within the `src/` directory, and rename it to `config.json`. You can then
update the values in the JSON file to your preference. The configuration file should look something like this:

```json
{
  "token": "YOUR_BOT_TOKEN",
  "prefix": "!",
  "mongoPath": "mongodb://localhost:27017/",
  "contractAddress": "0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3",
  "bscScanApiKey": "YOUR_API_KEY_GOES_HERE"
}
```

To find your bot's token, go to the [Discord Developer Portal](https://discordapp.com/developers/applications/) and create
a bot. Copy the token that Discord gives you, and place this inside of your configuration JSON file.

| Configuration Setting | Information |
| --------------------- | ----------- |
| `token` | Get this from Discord's Developer Portal |
| `prefix` | The prefix that will be used by the bot for each command |
| `mongoPath` | The [connection URI](https://docs.mongodb.com/manual/reference/connection-string/) for the Mongo database |
| `contractAddress` | The SafeBot contract address |
| `bscScanApiKey` | Your generated [BscScan API Key](https://bscscan.com/myapikey) from your BscScan account |

#### Running with Docker?

If you're running the SafeBot within a containerised environment such as Docker, ensure that
your `config.json` file references the container name for the `mongoPath` variable. From the
above example, we would rename `localhost` to `db`, to match the container name in the
[`docker-compose.yml`](https://github.com/Safemoon-Protocol/Discord-Bot/blob/main/docker-compose.yml#L16) file.

```json
{
  "mongoPath": "mongodb://username:password@db:27017/",
  ...
}
```

There is also a `.env.example` file that you will need to copy & rename to `.env` when using Docker.

From the `mongoPath` above, there is `username:password`, this should be whatever you set the environment
variables of `MONGODB_USERNAME` and `MONGODB_PASSWORD` to in the `.env` file.

You should set the `DISCORD_RUNNER` variable to either `local` or `shard`, depending on your criteria, see below.

| Discord Runner | Criteria |
| -------------- | -------- |
| `local` | If you're running the bot on your local machine or for a small Discord server |
| `shard` | If you're expecting the bot you're hosting to be on multiple large guilds |

If you're running the bot on your local machine or without Docker, you can
use the following command to start the bot.

```bash
$ npm run start
```

If you're using Docker & Docker Compose, you can use the following command
to start the bot and its services.

```bash
$ docker-compose up -d

# To view the logs of the bot, you can use this command
$ docker-compose logs -f bot
```

#### Additional Information

There are a few other commands that are baked into the `package.json` file for convenience.
You can find them in the table below.

| Command | Use Case |
| ------- | -------- |
| `npm run start` | Running the bot on your local machine |
| `npm run shard` | Running the bot on your local machine, for multiple large guilds |
| `npm run dev:local` | Run the bot via `nodemon`, to automatically restart it when files are changed |
| `npm run dev:shard` | Run the bot via `nodemon`, to automatically restart it when files are changed |
| `npm run docker:local` | **This command is used by `docker-compose.yml`**. Installs dependencies and then runs the bot without Discord sharding. |
| `npm run docker:shard` | **This command is used by `docker-compose.yml`**. Installs dependencies and then runs the bot with Discord sharding enabled. |

## License

Released under the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html) license.

## Contributors

Find the [list of ✨ awesome ✨ contributors here](https://github.com/Safemoon-Protocol/Discord-Bot/graphs/contributors).
Thank you to all who have contributed to the SafeMoon Discord Bot. 🚀
