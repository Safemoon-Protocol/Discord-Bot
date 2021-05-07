const _discord = require("discord.js");
const { token, verbose = false } = require("./config.json");

// Initialise our auto-managed shard
const manager = new _discord.ShardingManager('./src/bot.js', {
  token: token,
  respawn: true,
  totalShards: 'auto'
});

manager.on('shardCreate', (shard) => console.log(`[SHARD]: Shard ${shard.id} launched`));
manager.spawn()
  .then(shards => {
    if (verbose) {
      shards.forEach(shard => {
        shard.on('message', message => {
          console.log(`Shard[${shard.id}]: ${message._eval}: ${message._result}`);
        });
      });
    }
  })
  .catch(console.error);
