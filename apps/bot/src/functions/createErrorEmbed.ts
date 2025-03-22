import { colors, env, defaultAvatarUrl } from "@temp-server-creator/config"
import { EmbedBuilder, type User } from "discord.js"

export function createErrorEmbed(message: string, title: string, user: User) {
	return new EmbedBuilder()
		.setColor(colors.ERROR)
		.setTitle(title)
		.setDescription(message)
		.setFooter({ text: env.NAME })
		.setAuthor({
			name: user.username,
			iconURL: user.avatarURL() || defaultAvatarUrl
		})
}
