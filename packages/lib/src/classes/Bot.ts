import { type Client, REST, Routes } from "discord.js"
import { logger } from "@temp-server-creator/logger"
import { BotError } from "@temp-server-creator/logger"
import { env } from "@temp-server-creator/config"
import type { Command } from "@temp-server-creator/lib"
import path from "node:path"
import { readdirSync } from "node:fs"

export class Bot {
    public commands: Map<string, Command> = new Map();
    private _startTime?: Date

	constructor(
		private token: string,
		private client: Client,
		private dirName: string,
	) {
		this.client = client
		this.token = token
		this.dirName = dirName

		this.initializeEvents()
        this.initializeCommands()
	}

	public async start() {
		logger.info(`Starting ${env.NAME}`)
        this._startTime = new Date();
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
        const files = readdirSync(dir).filter(f => f.endsWith(".ts"))
        for (const file of files) {
            const eventPath = path.join(dir, file)
            const eventUrl = `file://${eventPath.replace(/\\/g, "/")}`
            const { default: event } = await import(eventUrl)
            const eventName = file.split(".")[0]
            logger.info(`Registered new event ${eventName}`)
            this.client.on(eventName, event)
        }
	}

    private async initializeCommands() {
        // biome-ignore lint/suspicious/noExplicitAny: json data
        const commands: any[] = []

        const dir = path.join(this.dirName, "commands")
        const files = readdirSync(dir).filter(f => f.endsWith(".ts"))

        for (const file of files) {
            const commandPath = path.join(dir, file)
            const commandUrl = `file://${commandPath.replace(/\\/g, "/")}`
            const commandName = file.split(".")[0]
            const { default: CommandClass } = await import(commandUrl)

            if (!CommandClass) {
                logger.warn(`Command ${commandName} has no default export; skipping`)
                continue;
            }

            const commandInstance: Command = new CommandClass();
            if (!commandInstance.data || !commandInstance.execute) {
                logger.warn(`Command ${commandName} has no data or execute properties; skipping`)
                continue;
            }

            this.commands.set(commandInstance.data.name, commandInstance)
            commands.push(commandInstance.data.toJSON())
            logger.info(`Successfully initialized command ${commandInstance.data.name}`)
            }

            this.deployCommands(commands)
		}

        // biome-ignore lint/suspicious/noExplicitAny: json data
        private async deployCommands(commands: any[]) {
            commands.length === 0 &&
				(() => {
					logger.warn("No commands to deploy")
                    return
				})()
                
            const rest = new REST().setToken(env.DISCORD_TOKEN)

            const data = await rest.put(
                Routes.applicationCommands(env.DISCORD_CLIENT_ID),
                { body: commands }
            // biome-ignore lint/suspicious/noExplicitAny: json data
            ) as any[]
            logger.info(`Successfully deployed ${data.length} commands`)
        }

        public get startTime(): Date {
            if (!this._startTime) {
                throw new BotError("startTime is falsy, bot hasn't started yet")
            }
            return this._startTime
        }
}