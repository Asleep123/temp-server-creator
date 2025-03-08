import { pino } from "pino"

interface Target {
	target: string
	// biome-ignore lint/suspicious/noExplicitAny: varies per target
	options: any
}

const targets: Target[] = [
	{
		target: "pino-pretty",
		options: {
			translateTime: "mm-dd-yyyy HH:MM:ss",
			colorize: true
		}
	}
]

export const logger = pino(
	{
		redact: ["DISCORD_TOKEN", "DATABASE_URL"],
		level: process.env.NODE_ENV === "development" ? "debug" : "info"
	},
	pino.transport({
		targets
	})
)
