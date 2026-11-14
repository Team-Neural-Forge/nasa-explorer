import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
	plugins: [pluginReact()],
	html: {
		title: "NASA Explorer",
		meta: {
			description:
				"A physics-based space exploration game for the NASA Space Apps Challenge 2026.",
			"theme-color": "#03060f",
			"og:title": {
				property: "og:title",
				content: "NASA Explorer",
			},
			"og:description": {
				property: "og:description",
				content:
					"Assemble a rocket, fly the solar system, and learn why it is hard.",
			},
			"og:type": {
				property: "og:type",
				content: "website",
			},
		},
	},
});
