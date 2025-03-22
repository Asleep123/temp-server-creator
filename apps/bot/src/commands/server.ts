import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	ChannelType,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	OverwriteType,
	PermissionsBitField
} from "discord.js"
import { createErrorEmbed } from "~/functions"
import { Command } from "@temp-server-creator/lib"
import { defaultAvatarUrl, env } from "@temp-server-creator/config"
import { database } from "@temp-server-creator/database"
import { InteractionError, logger } from "@temp-server-creator/logger"

export default class ServerCommand extends Command {
	public data = new SlashCommandBuilder()
		.setName("server")
		.setDescription("Manage your development servers")
		.addSubcommand((sc) =>
			sc
				.setName("create")
				.setDescription("Create a new development server")
				.addStringOption((o) =>
					o
						.setName("name")
						.setDescription("The name of the server")
						.setRequired(true)
						.setMaxLength(64)
				)
				.addUserOption((o) =>
					o
						.setName("bot")
						.setDescription("The Discord bot you wish to test")
						.setRequired(false)
				)
		)
		.addSubcommand((sc) =>
			sc
				.setName("delete")
				.setDescription("Delete an existing development server")
				.addStringOption((o) =>
					o
						.setName("server-id")
						.setDescription("The ID of the server to delete")
						.setRequired(false)
				)
		)
		.addSubcommand((sc) =>
			sc
				.setName("list")
				.setDescription("List and manage your development servers")
		)

	public async execute(interaction: ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand()

		switch (subcommand) {
			case "create": {
				if (interaction.client.guilds.cache.size >= 10) {
					logger.warn(
						"You have reached the limit of 10 development guilds. This is a Discord limitation, as only bots in less than 10 guilds can create them."
					)
					const embed = createErrorEmbed(
						"You have reached the limit of 10 development guilds.\nThis is a Discord limitation, as only bots in less than 10 guilds can create them.",
						"Error",
						interaction.user
					)
					await interaction.reply({
						embeds: [embed],
						flags: [MessageFlags.Ephemeral]
					})
					return
				}
				const nameOption = interaction.options.getString("name", true)
				const botOption = interaction.options.getUser("bot", false)
				const guild = await interaction.client.guilds.create({
					name: botOption
						? `${nameOption} | ${botOption.username}`
						: nameOption,
					icon: botOption?.avatarURL(),
					channels: [
						{
							name: "panel-do-not-delete",
							topic: "This is your server's control panel.",
							type: ChannelType.GuildText,
							permissionOverwrites: [
								{
									id: interaction.user.id,
									type: OverwriteType.Member,
									deny: [
										PermissionsBitField.Flags.SendMessages
									]
								}
							]
						}
					]
				})
				// biome-ignore lint/style/noNonNullAssertion: the channel is created when the guild is created, there's zero reason it wouldn't exist
				const panelChannel = guild.channels.cache.find((f) =>
					f.name.includes("panel")
				)!
				await database.guild.create({
					data: {
						id: guild.id,
						botId: botOption?.id,
						panelId: panelChannel.id
					}
				})
				const invite = await guild.invites.create(panelChannel.id, {
					maxUses: 1,
					maxAge: 0,
					reason: "Initial Invite"
				})
				await interaction.reply({
					content: `https://discord.gg/${invite.code}`,
					flags: [MessageFlags.Ephemeral]
				})
				break
			}

			case "delete": {
				const guildId = interaction.options.getString(
					"server-id",
					false
				)
				if (guildId) {
					const guild = interaction.client.guilds.cache.get(guildId)
					if (!guild) {
						const embed = createErrorEmbed(
							`No guild with ID \`${guildId}\` was found.`,
							"Error",
							interaction.user
						)
						await interaction.reply({
							embeds: [embed],
							flags: [MessageFlags.Ephemeral]
						})
						return
					}
					if (guild.ownerId !== interaction.client.user.id) {
						const embed = createErrorEmbed(
							"I am not the owner of this guild, therefore I cannot delete it.",
							"Error",
							interaction.user
						)
						await interaction.reply({
							embeds: [embed],
							flags: MessageFlags.Ephemeral
						})
						return
					}

					const row =
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setCustomId(
									`confirmDeleteButton:${interaction.user.id}:${guildId}`
								)
								.setLabel("Confirm")
								.setStyle(ButtonStyle.Danger),
							new ButtonBuilder()
								.setCustomId(
									`cancelDeleteButton:${interaction.user.id}`
								)
								.setLabel("Cancel")
								.setStyle(ButtonStyle.Secondary)
						)
					const embed = new EmbedBuilder()
						.setAuthor({
							name: interaction.user.username,
							iconURL:
								interaction.user.avatarURL() || defaultAvatarUrl
						})
						.setTitle("Delete Server")
						.setDescription(
							`Are you sure you want to **permanently** delete \`${guild.name}\`?`
						)
						.setFooter({ text: env.NAME })
					await interaction.reply({
						embeds: [embed],
						components: [row]
					})
				} else {
					const options = interaction.client.guilds.cache
						.filter(
							(guild) =>
								guild.ownerId === interaction.client.user.id
						)
						.map((guild) => {
							return new StringSelectMenuOptionBuilder()
								.setLabel(guild.name)
								.setDescription(`ID: ${guild.id}`)
								.setValue(guild.id)
						})
					if (options.length === 0) {
						const embed = createErrorEmbed(
							"No servers found to delete. Create one using `/server create`!",
							"Error",
							interaction.user
						)
						await interaction.reply({
							embeds: [embed],
							flags: [MessageFlags.Ephemeral]
						})
						return
					}
					const row =
						new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
							new StringSelectMenuBuilder()
								.setCustomId(
									`deleteServerSelect:${interaction.user.id}`
								)
								.setPlaceholder("Choose a server...")
								.addOptions(options)
						)
					const embed = new EmbedBuilder()
						.setAuthor({
							name: interaction.user.username,
							iconURL:
								interaction.user.avatarURL() || defaultAvatarUrl
						})
						.setTitle("Delete Server")
						.setDescription("Choose a server to delete.")
						.setFooter({ text: env.NAME })
					await interaction.reply({
						embeds: [embed],
						components: [row]
					})
				}
				break
			}

			case "list": {
				const options = interaction.client.guilds.cache
					.filter(
						(guild) => guild.ownerId === interaction.client.user.id
					)
					.map((guild) => {
						return new StringSelectMenuOptionBuilder()
							.setLabel(guild.name)
							.setDescription(`ID: ${guild.id}`)
							.setValue(guild.id)
					})
				const row =
					new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
						new StringSelectMenuBuilder()
							.setCustomId(
								`listServerSelect:${interaction.user.id}`
							)
							.setPlaceholder("Choose a server...")
							.setOptions(options)
					)
				const embed = new EmbedBuilder()
					.setAuthor({
						name: interaction.user.username,
						iconURL:
							interaction.user.avatarURL() || defaultAvatarUrl
					})
					.setTitle("List Servers")
					.setDescription(
						"Choose a server to manage it or get more information on it."
					)
					.setFooter({ text: env.NAME })
				await interaction.reply({ embeds: [embed], components: [row] })
				break
			}
            
			default:
				throw new InteractionError(
					interaction,
					`No such subcommand "${subcommand}" was found`,
					interaction.commandName
				)
		}
	}
}
