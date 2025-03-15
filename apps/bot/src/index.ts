import { env, intents } from "@temp-server-creator/config"
import { Bot, CustomClient } from "@temp-server-creator/lib"

const client = new CustomClient({
	intents: intents
})

const bot = new Bot(env.DISCORD_TOKEN, client, __dirname)
client.bot = bot

await bot.start()