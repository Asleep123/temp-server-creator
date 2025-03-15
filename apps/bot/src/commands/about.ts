import { SlashCommandBuilder, type CommandInteraction, EmbedBuilder } from "discord.js";
import { env, defaultAvatarUrl } from "@temp-server-creator/config";
import { type CustomClient, Command } from "@temp-server-creator/lib";
import os from "node:os";

export default class AboutCommand extends Command {
    public data = new SlashCommandBuilder()
        .setName("about")
        .setDescription(`About ${env.NAME}`);

    public async execute(interaction: CommandInteraction) {
        const systemUptime = os.uptime() >= 3600 * 24 ? `${(os.uptime() / 60 / 60 / 24).toFixed(2)} day(s)` : `${(os.uptime() / 60 / 60).toFixed(2)} hour(s)`
        const botUptimeMs = new Date().getTime() - (interaction.client as CustomClient).bot.startTime.getTime()
        const botUptime = botUptimeMs >= 1000 * 3600 * 24 ? `${(botUptimeMs / 1000 / 60 / 60 / 24).toFixed(2)} day(s)` : `${(botUptimeMs / 1000 / 60 / 60).toFixed(2)} hour(s)`
        const embed = new EmbedBuilder()
            .setFooter({ text: env.NAME })
            .setDescription(`${env.NAME} is a self hosted instance of Temporary Server Creator, a development tool for Discord bot devs to test their bots in a sandboxed environment.`)
            .addFields({ name: "GitHub", value: "https://github.com/Asleep123/temp-server-creator" }, { name: "Statistics", value: `**Memory:** ${((os.totalmem() - os.freemem()) / 1e+9).toFixed(2)}gb / ${(os.totalmem() / 1e+9).toFixed(2)}gb\n**Uptime (system):** ${systemUptime}\n**Uptime (bot):** ${botUptime}` })
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || defaultAvatarUrl });

        await interaction.reply({ embeds: [embed] });
    }
}
