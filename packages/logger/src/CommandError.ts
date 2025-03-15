import { logger } from "./logger";
import { type CommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { colors, env } from "@temp-server-creator/config";

export class CommandError extends Error {
	message: string
    interaction: CommandInteraction
	constructor(interaction: CommandInteraction, message: string) {
		super(message)
		this.message = message
        this.interaction = interaction
		logger.error(this)

        const embed = new EmbedBuilder()
            .setColor(colors.ERROR)
            .setTitle("An error has occurred")
            .addFields({ name: "Interaction Info", value: `**Command Name:** ${interaction.commandName}` }, { name: "Stack Trace", value: this.stack || "undefined" })
            .setDescription(message)
            .setFooter({ text: "This has been logged to console." })
            .setAuthor({ name: env.NAME })

        try {
            if (interaction.replied || interaction.deferred) {
                interaction.followUp({ embeds: [embed], flags: [ MessageFlags.Ephemeral ] })
            } else {
                interaction.reply({ embeds: [embed], flags: [ MessageFlags.Ephemeral ] })
            }
        } catch (e) {
            logger.error(`Error whilst replying to errored interaction: ${e}`)
        }
	}
}
