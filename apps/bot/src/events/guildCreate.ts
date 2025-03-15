import { logger } from "@temp-server-creator/logger";
import type { Guild } from "discord.js";

export default async function onGuildCreate(guild: Guild) {
    if (guild.ownerId !== guild.client.user.id) {
        logger.warn(`Joined guild ${guild.name}, however this application is meant to be used in a user app context. Automatically left guild. It is recommended you disable guild installations in the Discord developer portal. (https://discord.dev)`)
        await guild.leave()
    }
}