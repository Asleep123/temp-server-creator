import { ownerId } from "@temp-server-creator/config"
import { type Message, ChannelType, type Client } from "discord.js"
import { logger } from "@temp-server-creator/logger"
import { database } from "@temp-server-creator/database"
import { config, env } from "@temp-server-creator/config"
import * as lib from "@temp-server-creator/lib"
import util from "node:util"

const dev = {
	database,
	logger,
	config,
	lib
}

export default async function onMessageCreate(message: Message) {
	if (message.content.startsWith(`<@${message.client.user.id}> eval `)) {
		const toEval = message.content.split(" ").slice(2).join(" ")
		if (message.channel.type === ChannelType.DM) return
		logger.info(
			// biome-ignore lint/style/noNonNullAssertion: checked beforehand
			`Eval attempted by ${message.author.username} (${message.author.id}) in ${message.guild!.name} (${message.guild!.id}) in ${message.channel.name} (${message.channel.id}): ${toEval}`
		)
		if (message.author.id === ownerId) {
			const evalClass = new Eval(toEval, message.client, dev)
			const result = evalClass.execute()
			if (result.resultFiltered && result.resultFiltered.length > 2000) {
				return await message.reply({
					content: `\`${result.type}\``,
					files: [
						{
							attachment: Buffer.from(result.resultFiltered),
							name: "eval-result.js"
						}
					]
				})
			}
			await message.reply(
				`\`\`\`ts\n${result.resultFiltered}\n\`\`\`\n\n\`${result.type}\``
			)
		} else {
			await message.reply("You do not own this bot!")
		}
	}
}

export class Eval {
	private dev: { [key: string]: unknown }
	private client: Client
	private toEval: string
	constructor(
		toEval: string,
		client: Client,
		context: { [key: string]: unknown }
	) {
		this.client = client
		this.dev = context
		this.toEval = toEval
	}

	public execute() {
		try {
			const result = eval(this.toEval)
			const type = typeof result
			const resultFiltered = util
				.inspect(result, { depth: 2, compact: false })
				.replaceAll(env.DISCORD_TOKEN, "[REDACTED]")
			return {
				type,
				resultFiltered
			}
		} catch (e) {
			logger.debug(`Error whilst executing eval: ${e}`)
			return {
				type: typeof e,
				e
			}
		}
	}
}
