import { EmbedBuilder, type ButtonInteraction } from "discord.js"
import { Button } from "@temp-server-creator/lib"
import { defaultAvatarUrl, env } from "@temp-server-creator/config"

export default class CancelDeleteButton extends Button {
	public customId = "cancelDeleteButton"

	public async execute(interaction: ButtonInteraction) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.avatarURL() || defaultAvatarUrl
			})
			.setTitle("Server Delete Canceled")
			.setDescription("This action has been canceled.")
			.setFooter({ text: env.NAME })
		await interaction.update({ embeds: [embed], components: [] })
	}
}
