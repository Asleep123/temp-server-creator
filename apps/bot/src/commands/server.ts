import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder, MessageFlags, ChannelType } from "discord.js";
import { Command } from "@temp-server-creator/lib";
import { colors, defaultAvatarUrl } from "@temp-server-creator/config";
import { database } from "@temp-server-creator/database";
import { CommandError, logger } from "@temp-server-creator/logger";

export default class ServerCommand extends Command {
    public data = new SlashCommandBuilder()
        .setName("server")
        .setDescription("Manage your development servers")
        .addSubcommand(sc => sc
            .setName("create")
            .setDescription("Create a new development server")
            .addStringOption(o => o
                .setName("name")
                .setDescription("The name of the server")
                .setRequired(true)
                .setMaxLength(64)
            )
            .addUserOption(o => o
                .setName("bot")
                .setDescription("The Discord bot you wish to test.")
                .setRequired(false)
            )
        )

    public async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand()

        switch (subcommand) {
            case "create": {
                if (interaction.client.guilds.cache.size >= 10) {
                    logger.warn("You have reached the limit of 10 development guilds. This is a Discord limitation, as only bots in less than 10 guilds can create them.")
                    const embed = new EmbedBuilder()
                        .setColor(colors.ERROR)
                        .setDescription("You have reached the limit of 10 development guilds.\nThis is a Discord limitation, as only bots in less than 10 guilds can create them.")
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || defaultAvatarUrl });
                        await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] })
                }
                const nameOption = interaction.options.getString("name", true)
                const botOption = interaction.options.getUser("bot", false)
                const guild = await interaction.client.guilds.create({
                    name: botOption ? `${nameOption} | ${botOption}` : nameOption,
                    icon: botOption?.avatarURL(),
                    channels: [{
                        name: "panel-do-not-delete",
                        topic: "This is your server's control panel.",
                        type: ChannelType.GuildText
                    }]
                })
                // biome-ignore lint/style/noNonNullAssertion: the channel is created when the guild is created, there's zero reason it wouldn't exist
                const panelChannel = guild.channels.cache.find(f => f.name.includes("panel"))!
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
                const embed = new EmbedBuilder()
                    .setTitle("Server Created")
                    .setColor(colors.SUCCESS)
                    .addFields({ name: "Invite", value: `https://discord.gg/${invite.code}` })
                    .setImage(guild.iconURL())
                await interaction.reply({ embeds: [embed] })
                break;
            }
            default:
                throw new CommandError(interaction, `No such subcommand "${subcommand}" was found`)
        }
            
    }
}
