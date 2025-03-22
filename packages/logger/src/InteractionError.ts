import { logger } from "./logger"
import {
	type CommandInteraction,
	type StringSelectMenuInteraction,
	type ButtonInteraction,
	EmbedBuilder,
	MessageFlags
} from "discord.js"
import { colors, env } from "@temp-server-creator/config"

export class InteractionError extends Error {
	message: string
	interaction:
		| CommandInteraction
		| ButtonInteraction
		| StringSelectMenuInteraction
	interactionName: string
	constructor(
		interaction:
			| CommandInteraction
			| ButtonInteraction
			| StringSelectMenuInteraction,
		message: string,
		interactionName: string
	) {
		super(message)
		this.message = message
		this.interaction = interaction
		this.interactionName = interactionName
		logger.error(this)

		const embed = new EmbedBuilder()
			.setColor(colors.ERROR)
			.setTitle("An error has occurred")
			.addFields(
				{
					name: "Interaction Info",
					value: `**Interaction Name:** \`${this.interactionName}\``
				},
				{ name: "Stack Trace", value: this.stack || "undefined" }
			)
			.setDescription(message)
			.setFooter({ text: "This has been logged to console." })
			.setAuthor({ name: env.NAME })

		try {
			if (interaction.replied || interaction.deferred) {
				interaction.followUp({
					embeds: [embed],
					flags: [MessageFlags.Ephemeral]
				})
			} else {
				interaction.reply({
					embeds: [embed],
					flags: [MessageFlags.Ephemeral]
				})
			}
		} catch (e) {
			logger.error(`Error whilst replying to errored interaction: ${e}`)
		}
	}
}
