import {
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	type CommandInteraction,
	StringSelectMenuOptionBuilder,
	EmbedBuilder,
	ActionRowBuilder
} from "discord.js"
import { defaultAvatarUrl } from "@temp-server-creator/config"
import { Command } from "@temp-server-creator/lib"

export default class SelectMenuCommand extends Command {
	public data = new SlashCommandBuilder()
		.setName("selectmenu")
		.setDescription("this isn't gonna work")

	public async execute(interaction: CommandInteraction) {
		const embed = new EmbedBuilder()
			.addFields({ name: "select", value: "choose option idiot" })
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.avatarURL() || defaultAvatarUrl
			})

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("test_sel")
			.setPlaceholder("Choose an option")
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel("Option 1")
					.setValue("option_1"),
				new StringSelectMenuOptionBuilder()
					.setLabel("Option 2")
					.setValue("option_2"),
				new StringSelectMenuOptionBuilder()
					.setLabel("Option 3")
					.setValue("option_3")
			)

		const row =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				selectMenu
			)

		await interaction.reply({ embeds: [embed], components: [row] })
	}
}
