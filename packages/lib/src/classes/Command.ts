import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, CommandInteraction } from "discord.js";

export abstract class Command {
    public abstract data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    public abstract execute(interaction: CommandInteraction): Promise<void>;
}
