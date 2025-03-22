import type { ButtonInteraction } from "discord.js"
import { Button } from "@temp-server-creator/lib"
import { database } from "@temp-server-creator/database"
import { InteractionError } from "@temp-server-creator/logger"
import { createSuccessEmbed } from "~/functions"

export default class ConfirmDeleteButton extends Button {
	public customId = "confirmDeleteButton"

	public async execute(interaction: ButtonInteraction) {
		const [, , guildId] = interaction.customId.split(":")

		const guild = interaction.client.guilds.cache.get(guildId)
		if (!guild) {
			throw new InteractionError(
				interaction,
				"Guild not found from confirm button, why the hell is this happening",
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
