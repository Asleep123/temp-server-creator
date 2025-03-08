import { logger } from "./logger"

export class BotError extends Error {
	message: string

	constructor(message: string) {
		super(message)
		this.message = message
		logger.error(this)
	}
}
