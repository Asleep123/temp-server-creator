import { SlashCommandBuilder, type CommandInteraction, EmbedBuilder } from "discord.js";
import { env, defaultAvatarUrl } from "@temp-server-creator/config";
import { Command } from "@temp-server-creator/lib";

export default class PingCommand extends Command {
    public data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get the bot latency");

    public async execute(interaction: CommandInteraction) {
        const ping = interaction.client.ws.ping;
        const embed = new EmbedBuilder()
            .setFooter({ text: env.NAME })
            .addFields({ name: "Pong!", value: `**Latency**: ${ping}ms` })
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || defaultAvatarUrl });

        await interaction.reply({ embeds: [embed] });
    }
}
