const { getPrice, getBurnedTotal, getCMCData } = require('./external')
const { contractAddress } = require('../config.json')

async function fetchPriceEmbed(client) {
  try {
    let price = await getPrice()
    // let volume = (dexGuruData['volume24hUSD'] / 1_000_000).toFixed(4)
  
    let burnTotal = await getBurnedTotal()
    let timeStamp = Date.now()
    
    let cmcData = await getCMCData()
    let cmcBase = cmcData.data[8757]
    let cmcQuote = cmcBase['quote']['USD']
    let circ_supply = 1000 - burnTotal
    let marketCap = (circ_supply * 1_000_000 * price).toFixed(4)
    
    let change1h = cmcQuote['percent_change_1h'].toFixed(4)
    let change24h = cmcQuote['percent_change_24h'].toFixed(4)
    let change7d = cmcQuote['percent_change_7d'].toFixed(4)
    
    return {
      embed: {
        "title": "**" + contractAddress.toLowerCase() + "**",
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
            "value": "Disabled"/*"$" + volume + "M"*/,
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
            "value": circ_supply.toFixed(2) + "T",
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
    };
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  fetchPriceEmbed
}
