import { PrismaClient } from "@prisma/client"

export const database = new PrismaClient({
	errorFormat: "pretty",
	log:
		process.env.NODE_ENV === "development"
			? ["query", "info", "error", "warn"]
			: ["error"]
})
