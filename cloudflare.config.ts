import { defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "kakisashi",
		domains: ["kakisashi.arca0928.dev"],
		compatibilityDate: "2026-10-23",
		compatibilityFlags: [
			"nodejs_compat",
		],
		entrypoint: "@tanstack/react-start/server-entry",
	},
});
