//Dependencies.
const { Client, Message } = require('discord.js');
const dotenv = require('dotenv');
const axios = require('axios').default;
const contractAddress = "0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3"; //SAFEMOON Contract Address

//Load Environment
dotenv.config();
console.log(process.env.DISCORD_TOKEN);

//Create an instance of client
const client = new Client();

//Login
client.login(process.env.DISCORD_TOKEN);
client.on('ready', () => {
    console.log(client.user.tag + ' has logged in.');
});

/**
 * Function for obtaining data from Dex.Guru's API.
 * @returns Dex.Guru's API data
 */
async function getApi() {
    try {
        let response = await axios.get('https://api.dex.guru/v1/tokens/' + contractAddress + '-bsc/');
        return response.data;
    } catch (err) {
        console.log(err);
        return "Failed";
    }
}

/**
 * Function for obtaining the total burned supply from BSCSCAN.
 * @returns total Burned Supply to-date.
 */
async function getBurnedTotal() {
    try {
        let response = await axios.get('https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3&address=0x0000000000000000000000000000000000000001&tag=latest&apikey=YOUR_API_KEY_GOES_HERE');
        let value = response.data['result'];
        value = (value / 1_000_000_000_000_000_000_000).toFixed(4);
        return value;
    } catch (err) {
        console.log(err);
        return "Failed";
    }
}

/**
 * Function for obtaining data from CoinMarketCap's Api.
 * @returns CoinMarketCap's widget API json data
 */
async function getCMCData() {
    try {
        let response = await axios.get('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=8757');
        return response.data;
    } catch (err) {
        console.log(err);
        return "Failed"
    }
}

/**
 * Method for getting the current price.
 * @returns price
 */
async function getPrice() {
    try {
        let dexGuruData = await getApi();
        price = dexGuruData['priceUSD'];
        price *= Math.pow(10, 10);
        return price.toPrecision(6);
    } catch (err) {
        console.log(err);
        return "Failed";
    }
}

/**
 * Function for sending the stand-alone price to a specific channel.
 */
let previousPrice, price;
async function postPrice(channelId) {
    try {
        let price = await getPrice();
        let channel = client.channels.cache.get(channelId);
        if (price > 0) {
            let emoji = price > previousPrice ? "<:GreenSafu:828471113754869770>" : "<:RedSafu:828471096734908467>";
            await channel.send(emoji + " " + price);
            previousPrice = price;
        }
    } catch (err) {
        console.log(err);
        return "Failed";
    }
}

/**
 * Sends the stand-alone price every 20 seconds to desired channel.
 */
setInterval(() => postPrice("824212242480103445"), 20 * 1000); //Change this to your Channel Id

/**
 * Basic message command.
 */
client.on('message', message => {
    if (message.content == '!price') {
        postPrice(message.channel.id);
    }
});

/**
 * Function for sending the Embedded price display every 5 minutes.
 */
setInterval(async function () {
    try {
        let dexGuruData = await getApi();
        let price = dexGuruData['priceUSD'].toFixed(dexGuruData['decimals']);
        let volume = (dexGuruData['volume24hUSD'] / 1_000_000).toFixed(4);
        let channel = client.channels.cache.get('824212242480103445');

        let burnTotal = await getBurnedTotal();
        let timeStamp = Date.now();

        let cmcData = await getCMCData();
        let cmcBase = cmcData.data[8757];
        let cmcQuote = cmcBase['quote']['USD'];
        let total_supply = cmcBase['total_supply'];
        let marketCap = ((total_supply * price) / 1_000_000).toFixed(4);

        let change1h = cmcQuote['percent_change_1h'].toFixed(4);
        let change24h = cmcQuote['percent_change_24h'].toFixed(4);
        let change7d = cmcQuote['percent_change_7d'].toFixed(4);

        await channel.send({
            embed: {
                "title": "**" + contractAddress + "**",
                "description": "This bot will automatically post new stats every 5 minutes.",
                "url": "https://bscscan.com/address/" + contractAddress,
                "color": 2029249,
                "timestamp": timeStamp,
                "footer": {
                    "text": "SafeMoon Price Bot - Values based on USD."
                },
                "thumbnail": {
                    "url": "https://i.imgur.com/cAjC1Pz.png"
                },
                "author": {
                    "name": "SafeMoon Price Bot",
                    "url": "https://safemoon.net"
                },
                "fields": [
                    {
                        "name": "💸 Price",
                        "value": "$" + price,
                        "inline": true
                    },
                    {
                        "name": "🧊 Volume",
                        "value": "$" + volume + "M",
                        "inline": true
                    },
                    {
                        "name": "💰 Market Cap",
                        "value": marketCap + "M",
                        "inline": true
                    },
                    {
                        "name": "🏦 Total Supply",
                        "value": "1000T",
                        "inline": true
                    },
                    {
                        "name": "🔥 Total Burned",
                        "value": burnTotal + "T",
                        "inline": true
                    },
                    {
                        "name": "💱 Circ Supply",
                        "value": (total_supply / 1_000_000_000_000).toFixed(2) + "T",
                        "inline": true
                    },
                    {
                        "name": "💯 1hr Change",
                        "value": change1h > 0 ? "⬆️ " + change1h + "%" : "⬇️ " + change1h + "%",
                        "inline": true
                    },
                    {
                        "name": "📈 24hr Change",
                        "value": change24h > 0 ? "⬆️ " + change24h + "%" : "⬇️ " + change24h + "%",
                        "inline": true
                    },
                    {
                        "name": "📈 7D Change",
                        "value": change7d > 0 ? "⬆️ " + change7d + "%" : "⬇️ " + change7d + "%",
                        "inline": true
                    }
                ]
            }
        });
    } catch (err) {
        console.log(err);
    }
}, 300 * 1000); //(x * 1000) this will post in the designated channel every 'x' seconds.
