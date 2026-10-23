import { defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "tanstack-start-app",
		compatibilityDate: "2026-10-23",
		compatibilityFlags: [
			"nodejs_compat",
		],
		entrypoint: "@tanstack/react-start/server-entry",
	},
});
