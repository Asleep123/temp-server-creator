import { env } from "./env"
import { GatewayIntentBits } from "discord.js"

export const ownerId = env.OWNER_ID
export const intents = [
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers
]

export const config = {
	intents,
	ownerId
}

export * from "./env"
