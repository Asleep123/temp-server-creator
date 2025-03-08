import { z } from "zod"

export const envSchema = z.object({
	DISCORD_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	DATABASE_URL: z.string(),
	OWNER_ID: z.string().optional(),
	NAME: z.string().optional().default("Temporary Server Creator")
})

export const env = envSchema.parse(process.env)
