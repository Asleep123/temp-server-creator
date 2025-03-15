import { SlashCommandBuilder, type CommandInteraction } from "discord.js";
import { Command } from "@temp-server-creator/lib";
import { CommandError } from "@temp-server-creator/logger";

export default class ErrorCommand extends Command {
    public data = new SlashCommandBuilder()
        .setName("error")
        .setDescription("Error the bot to test error handling");

    public async execute(interaction: CommandInteraction) {
        throw new CommandError(interaction, "Intentional error")
    }
}