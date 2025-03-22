import { env } from "./env"
import { GatewayIntentBits } from "discord.js"

export const ownerId = env.OWNER_ID
export const intents = [
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers
]

export const defaultAvatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png"

export enum colors {
	ERROR = "#ed4337",
	SUCCESS = "#5cb85c"
}

export const config = {
	intents,
	ownerId,
	defaultAvatarUrl,
	colors
}

export * from "./env"
