const _discord = require("discord.js");
const { token } = require("./config.json");

// Initialise our auto-managed shard
const manager = new _discord.ShardingManager('./src/bot.js', {
  token: token,
  respawn: true,
  totalShards: 'auto'
});

manager.on('shardCreate', (shard) => console.log(`[SHARD]: Shard ${shard.id} launched`));
manager.spawn();
