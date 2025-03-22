import type { StringSelectMenuInteraction } from "discord.js"
import { SelectMenu } from "@temp-server-creator/lib"
import { database } from "@temp-server-creator/database"
import { createSuccessEmbed } from "~/functions"
import { InteractionError } from "@temp-server-creator/logger"

export default class DeleteServerSelectMenu extends SelectMenu {
	public customId = "deleteServerSelect"

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
		await guild.delete()
		const updated = await database.guild.update({
			where: {
				id: guildId
			},
			data: {
				deleted: true,
				deletedOn: new Date()
			}
		})
		if (!updated) {
			throw new InteractionError(
				interaction,
				"Guild not found in database",
				interaction.customId
			)
		}
		const embed = createSuccessEmbed(
			`Successfully deleted guild \`${guild.name}\`.`,
			"Success",
			interaction.user
		)
		await interaction.update({ embeds: [embed], components: [] })
	}
}
