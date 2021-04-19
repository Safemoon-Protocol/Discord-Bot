const _discord = require("discord.js");
const { token } = require("./config.json");

// Initialise our auto-managed shard
const manager = new _discord.ShardingManager('./bot.js', {
  token: token,
  respawn: true
});

manager.spawn();
