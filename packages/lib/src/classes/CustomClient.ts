import { Client, type ClientOptions } from "discord.js"
import type { Bot } from "./Bot"

export class CustomClient extends Client {
	public bot: Bot | undefined
	constructor(clientOptions: ClientOptions, bot?: Bot) {
		super(clientOptions)

		this.bot = bot
	}
}
