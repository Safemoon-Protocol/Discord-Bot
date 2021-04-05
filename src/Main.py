import discord, asyncio, requests

client = discord.Client()
contract = "0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3"
channel = client.get_channel(828434633523855360)

@client.event
async def on_ready():
    client.loop.create_task(show_price())

async def show_price():
    while True:
        response = requests.get("https://api.dex.guru/v1/tokens/" + contract + "-bsc/")
        data = response.json()["priceUSD"]
        data *= pow(10, 10)
        message = await client.get_guild(809736934963281920).get_channel(828434633523855360).send(data)
        await asyncio.sleep(5)
        await message.delete()

client.run('TOKEN')
