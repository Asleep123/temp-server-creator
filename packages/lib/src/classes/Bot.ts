import type { Client } from "discord.js"
import { logger } from "@temp-server-creator/logger"
import { BotError } from "@temp-server-creator/logger"
import { env } from "@temp-server-creator/config"
import path from "node:path"
import fs from "node:fs"

export class Bot {
	constructor(
		private token: string,
		private client: Client,
		private dirName: string
	) {
		this.client = client
		this.token = token
		this.dirName = dirName

		this.initializeEvents()
	}

	public async start() {
		logger.info(`Starting ${env.NAME}`)
		await this.client.login(this.token).catch((e) => {
			throw new BotError(`Failed to start bot: ${e}`)
		})
		logger.info(
			`Logged in as ${this.client.user?.username}#${this.client.user?.discriminator} (${this.client.user?.id})`
		)
	}

	public async exit(code = 0) {
		logger.info(`Received shutdown command; stopping ${env.NAME}`)
		await this.client.destroy()
		process.exit(code)
	}

	private async initializeEvents() {
		const dir = path.join(this.dirName, "events")
		fs.readdir(dir, async (e, files) => {
			e &&
				(() => {
					throw new BotError(`Failed to init events: ${e}`)
				})()

			for (const file of files) {
				const eventPath = path.join(dir, file)
				const eventUrl = `file://${eventPath.replace(/\\/g, "/")}`
				const eventFile = await import(eventUrl)
				const eventName = file.split(".")[0]
				const eventFunction = eventFile.default
				logger.info(`Registered new event ${eventName}`)
				this.client.on(eventName, eventFunction)
			}
		})
	}
}
