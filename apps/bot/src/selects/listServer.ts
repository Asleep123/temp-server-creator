import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	StringSelectMenuBuilder,
	type StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder
} from "discord.js"
import { SelectMenu } from "@temp-server-creator/lib"
import { defaultAvatarUrl, env } from "@temp-server-creator/config"
import { InteractionError } from "@temp-server-creator/logger"

export default class ListServerSelectMenu extends SelectMenu {
	public customId = "listServerSelect"

	public async execute(interaction: StringSelectMenuInteraction) {
		const guildId = interaction.values[0]

		const guild = interaction.client.guilds.cache.get(guildId)
		if (!guild) {
			throw new InteractionError(
				interaction,
				"Guild not found from select menu, why the hell is this happening",
				interaction.customId
			)
		}
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(
					`generateInviteButton:${interaction.user.id}:${guild.id}`
				)
				.setLabel("Generate Invite")
				.setStyle(ButtonStyle.Primary)
		)
		const options = interaction.client.guilds.cache
			.filter((guild) => guild.ownerId === interaction.client.user.id)
			.map((guild) => {
				return new StringSelectMenuOptionBuilder()
					.setLabel(guild.name)
					.setDescription(`ID: ${guild.id}`)
					.setValue(guild.id)
			})
		const row2 =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId(`listServerSelect:${interaction.user.id}`)
					.setPlaceholder("Choose a server...")
					.setOptions(options)
			)
		const embed = new EmbedBuilder()
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.avatarURL() || defaultAvatarUrl
			})
			.setTitle("Server Info")
			.setFields([
				{
					name: "Server Info",
					value: `**Name**: \`${guild.name}\`\n**ID**: \`${guild.id}\``
				},
				{
					name: "Controls",
					value: "Manage this server using the buttons below. Select a different server using the dropdown."
				}
			])
			.setImage(guild.iconURL())
			.setFooter({ text: env.NAME })

		await interaction.update({ embeds: [embed], components: [row, row2] })
	}
}
