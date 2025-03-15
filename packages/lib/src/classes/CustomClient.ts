import { Client, type ClientOptions } from "discord.js"
import type { Bot } from "@temp-server-creator/lib"
import { BotError } from "@temp-server-creator/logger"

export class CustomClient extends Client {
	private _bot?: Bot

	constructor(clientOptions: ClientOptions, bot?: Bot) {
		super(clientOptions)
		this._bot = bot
	}

	public get bot(): Bot {
		if (!this._bot) {
			throw new BotError("Bot is not initialized yet")
		}
		return this._bot
	}

	public set bot(value: Bot) {
		this._bot = value
	}
}
