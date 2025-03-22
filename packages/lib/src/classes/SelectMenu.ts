import type { StringSelectMenuInteraction } from "discord.js"

export abstract class SelectMenu {
	public abstract customId: string
	public abstract execute(
		interaction: StringSelectMenuInteraction
	): Promise<void>
}
