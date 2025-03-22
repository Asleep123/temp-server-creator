import {
	EmbedBuilder,
	MessageFlags,
	type CommandInteraction,
	type ButtonInteraction,
	type StringSelectMenuInteraction
} from "discord.js"
import type { CustomClient } from "@temp-server-creator/lib"
import { InteractionError } from "@temp-server-creator/logger"
import { env, colors, defaultAvatarUrl } from "@temp-server-creator/config"
import { createErrorEmbed } from "~/functions"

export default async function onInteractionCreate(
	interaction:
		| CommandInteraction
		| ButtonInteraction
		| StringSelectMenuInteraction
) {
	if (interaction.user.id !== env.OWNER_ID) {
		const embed = new EmbedBuilder()
			.setColor(colors.ERROR)
			.setFooter({ text: env.NAME })
			.setDescription(
				"You do not own this bot!\nCheck `OWNER_ID` in `.env` if this is a mistake."
			)
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.avatarURL() || defaultAvatarUrl
			})
		await interaction.reply({
			embeds: [embed],
			flags: [MessageFlags.Ephemeral]
		})
		return
	}

	const client = interaction.client as CustomClient

	if (interaction.isCommand()) {
		const command = client.bot.commands.get(interaction.commandName)
		if (!command) {
			throw new InteractionError(
				interaction,
				"Command not found",
				"Not Found"
			)
		}

		try {
			await command.execute(interaction)
		} catch (e) {
			if (e instanceof InteractionError) {
				return
			}

			throw new InteractionError(
				interaction,
				`Unexpected error whilst executing command: ${
					// biome-ignore lint/suspicious/noExplicitAny: its an error, can be anything
					(e as any).message
				}`,
				command.data.name
			)
		}
	} else if (interaction.isButton()) {
		const [action, userId] = interaction.customId.split(":")
		const button = client.bot.buttons.get(action)
		if (!button) {
			throw new InteractionError(
				interaction,
				"Button not found",
				"Not Found"
			)
		}
		if (userId !== interaction.user.id) {
			const embed = createErrorEmbed(
				"You did not run this command. Find your own button.",
				"Error",
				interaction.user
			)
			await interaction.reply({ embeds: [embed] })
			return
		}

		try {
			await button.execute(interaction)
		} catch (e) {
			if (e instanceof InteractionError) {
				return
			}

			throw new InteractionError(
				interaction,
				`Unexpected error whilst executing button: ${
					// biome-ignore lint/suspicious/noExplicitAny: its an error, can be anything
					(e as any).message
				}`,
				button.customId
			)
		}
	} else if (interaction.isStringSelectMenu()) {
		const [action, userId] = interaction.customId.split(":")
		const selectMenu = client.bot.selects.get(action)
		if (!selectMenu) {
			throw new InteractionError(
				interaction,
				"Select menu not found",
				"Not Found"
			)
		}
		if (userId !== interaction.user.id) {
			const embed = createErrorEmbed(
				"You did not run this command. Find your own select menu.",
				"Error",
				interaction.user
			)
			await interaction.reply({ embeds: [embed] })
			return
		}

		try {
			await selectMenu.execute(interaction)
		} catch (e) {
			if (e instanceof InteractionError) {
				return
			}

			throw new InteractionError(
				interaction,
				`Unexpected error whilst executing select menu: ${
					// biome-ignore lint/suspicious/noExplicitAny: its an error, can be anything
					(e as any).message
				}`,
				selectMenu.customId
			)
		}
	}
}
