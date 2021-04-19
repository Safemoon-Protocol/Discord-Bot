const axios = require('axios').default
const contractAddress = "0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3"

/**
 * Function for obtaining the price from pancakeswap's API.
 * @returns Pancakeswap's API data
 */
async function getPancakePrice() {
  try {
    let response = await axios.get('https://api.pancakeswap.info/api/tokens')
    return response.data
  } catch (err) {
    console.log(err)
    return "Failed"
  }
}

/**
* Function for obtaining the total burned supply from BSCSCAN.
* @returns total Burned Supply to-date.
*/
async function getBurnedTotal() {
  try {
    let response = await axios.get('https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=' + contractAddress + '&address=0x0000000000000000000000000000000000000001&tag=latest&apikey=YOUR_API_KEY_GOES_HERE');
    let value = response.data['result']
    value = (value / 1_000_000_000_000_000_000_000).toFixed(4)
    return value
  } catch (err) {
    console.log(err)
    return "Failed"
  }
}

/**
* Function for obtaining data from CoinMarketCap's Api.
* @returns CoinMarketCap's widget API json data
*/
async function getCMCData() {
  try {
    let response = await axios.get('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=8757')
    return response.data
  } catch (err) {
    console.log(err)
    return "Failed"
  }
}

/**
* Method for getting the current price.
* @returns price
*/
async function getPrice() {
  try {
    let panData = await getPancakePrice()
    let panBase = panData['data'][contractAddress]
    return price = parseFloat(panBase['price']).toFixed(9)
  } catch (err) {
    console.log(err)
    return "Failed"
  }
}

module.exports = {
  getPancakePrice,
  getBurnedTotal,
  getCMCData,
  getPrice
}
