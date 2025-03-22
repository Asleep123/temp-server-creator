import { MessageFlags, type ButtonInteraction } from "discord.js"
import { Button } from "@temp-server-creator/lib"
import { InteractionError } from "@temp-server-creator/logger"
import { database } from "@temp-server-creator/database"

export default class GenerateInviteButton extends Button {
	public customId = "generateInviteButton"

	public async execute(interaction: ButtonInteraction) {
		const [, , guildId] = interaction.customId.split(":")

		const guild = interaction.client.guilds.cache.get(guildId)
		if (!guild) {
			throw new InteractionError(
				interaction,
				"Guild not found from generate invite button, why the hell is this happening",
				interaction.customId
			)
		}
		const { panelId } = await database.guild.findFirstOrThrow({
			where: {
				id: guild.id
			},
			select: {
				panelId: true
			}
		})

		const invite = await guild.invites.create(panelId, {
			maxAge: 0
		})

		await interaction.reply({
			content: `https://discord.gg/${invite.code}`,
			flags: [MessageFlags.Ephemeral]
		})
	}
}
