import Stripe from "stripe";

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error(
		"STRIPE_SECRET_KEY is required. Please set it in your .env file.",
	);
}

// Initialize Stripe client with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2025-12-15.clover", // Use latest API version
	typescript: true,
	appInfo: {
		name: "Spicy Tales",
		version: "1.0.0",
	},
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
	currency: (process.env.STRIPE_CURRENCY || "usd") as string,
	publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
	webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
} as const;

// Validate webhook secret in production
if (process.env.NODE_ENV === "production" && !STRIPE_CONFIG.webhookSecret) {
	console.warn(
		"STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will fail.",
	);
}
