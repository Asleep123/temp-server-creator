import type { ButtonInteraction } from "discord.js"

export abstract class Button {
	public abstract customId: string
	public abstract execute(interaction: ButtonInteraction): Promise<void>
}
