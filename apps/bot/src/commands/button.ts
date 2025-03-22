import {
	SlashCommandBuilder,
	ButtonBuilder,
	type CommandInteraction,
	ButtonStyle,
	EmbedBuilder,
	ActionRowBuilder
} from "discord.js"
import { defaultAvatarUrl } from "@temp-server-creator/config"
import { Command } from "@temp-server-creator/lib"

export default class ButtonCommand extends Command {
	public data = new SlashCommandBuilder()
		.setName("button")
		.setDescription("button thingy")

	public async execute(interaction: CommandInteraction) {
		const embed = new EmbedBuilder()
			.addFields({ name: "field", value: "this is apparently a value" })
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.avatarURL() || defaultAvatarUrl
			})

		const button = new ButtonBuilder()
			.setCustomId("test")
			.setLabel("test")
			.setStyle(ButtonStyle.Primary)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

		await interaction.reply({ embeds: [embed], components: [row] })
	}
}
