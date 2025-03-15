import { EmbedBuilder, MessageFlags, type CommandInteraction } from "discord.js";
import type { CustomClient } from "@temp-server-creator/lib";
import { CommandError } from "@temp-server-creator/logger";
import { env, colors, defaultAvatarUrl } from "@temp-server-creator/config";

export default async function onInteractionCreate(interaction: CommandInteraction) {
    !interaction.isChatInputCommand() && (() => { return });

    if (interaction.user.id !== env.OWNER_ID) {
        const embed = new EmbedBuilder()
            .setColor(colors.ERROR)
            .setFooter({ text: env.NAME })
            .setDescription("You do not own this bot!\nCheck `OWNER_ID` in `.env` if this is a mistake.")
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || defaultAvatarUrl });
            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] })
    }

    const command = (interaction.client as CustomClient).bot.commands.get(interaction.commandName)
    !command && (() => {
        throw new CommandError(interaction, "Command not found")
    })()

    try {
        await command.execute(interaction)
    } catch (e) {
        if (e instanceof CommandError) {
            return
        }

        // biome-ignore lint/suspicious/noExplicitAny: its an error, we don't know what type it will be
        throw new CommandError(interaction, `Unexpected error whilst executing command: ${(e as any).message}`)
    }

}