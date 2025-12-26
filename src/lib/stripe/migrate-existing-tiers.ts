#!/usr/bin/env tsx
/**
 * One-time migration script to sync existing subscription tiers to Stripe
 *
 * This script creates Stripe Products and Prices for all existing subscription tiers
 * in the database that don't already have Stripe IDs.
 *
 * Usage:
 *   tsx --env-file=.env src/lib/stripe/migrate-existing-tiers.ts
 *
 * Requirements:
 * - STRIPE_SECRET_KEY must be set in .env
 * - Database must be running and accessible
 * - Subscription tiers must exist in subscription_tier_limits table
 */

import { db } from "../db";
import { syncAllTiersToStripe } from "./products";

async function main() {
	console.log("🚀 Starting Stripe tier migration...\n");

	try {
		// Check Stripe configuration
		if (!process.env.STRIPE_SECRET_KEY) {
			console.error("❌ ERROR: STRIPE_SECRET_KEY is not set in .env file");
			console.error(
				"   Please add your Stripe secret key to .env and try again.\n",
			);
			process.exit(1);
		}

		// Fetch all tiers from database
		const tiers = await db
			.selectFrom("subscription_tier_limits")
			.selectAll()
			.execute();

		if (tiers.length === 0) {
			console.log("⚠️  No subscription tiers found in database.");
			console.log("   Run database migrations first: pnpm db:migrate\n");
			process.exit(0);
		}

		console.log(`📊 Found ${tiers.length} subscription tier(s) in database:\n`);

		for (const tier of tiers) {
			const hasStripeId = !!tier.stripe_product_id;
			const status = hasStripeId ? "✓ Already synced" : "○ Not synced";
			console.log(`   ${status} - ${tier.name} (${tier.tier})`);
			if (hasStripeId) {
				console.log(`      Product: ${tier.stripe_product_id}`);
				console.log(
					`      Monthly Price: ${tier.stripe_price_id_monthly || "N/A"}`,
				);
				console.log(
					`      Yearly Price: ${tier.stripe_price_id_yearly || "N/A"}\n`,
				);
			}
		}

		const tiersToSync = tiers.filter((t) => !t.stripe_product_id);

		if (tiersToSync.length === 0) {
			console.log("\n✅ All tiers are already synced to Stripe.");
			console.log("   Nothing to do!\n");
			process.exit(0);
		}

		console.log(`\n🔄 Syncing ${tiersToSync.length} tier(s) to Stripe...\n`);

		// Sync all tiers to Stripe
		const results = await syncAllTiersToStripe();

		// Display results
		console.log("\n📝 Migration Results:\n");

		let successCount = 0;
		let failCount = 0;

		for (const result of results) {
			if (result.success) {
				successCount++;
				console.log(`✅ ${result.tier}:`);
				console.log(`   Product ID: ${result.result?.productId}`);
				console.log(`   Monthly Price ID: ${result.result?.monthlyPriceId}`);
				if (result.result?.yearlyPriceId) {
					console.log(`   Yearly Price ID: ${result.result.yearlyPriceId}`);
				}
				console.log();
			} else {
				failCount++;
				console.log(`❌ ${result.tier}: Failed`);
				console.log(`   Error: ${result.error}`);
				console.log();
			}
		}

		console.log("─".repeat(60));
		console.log(`\n📊 Summary:`);
		console.log(`   ✅ Successful: ${successCount}`);
		console.log(`   ❌ Failed: ${failCount}`);
		console.log(`   📦 Total: ${results.length}\n`);

		if (failCount > 0) {
			console.log(
				"⚠️  Some tiers failed to sync. Check the errors above and try again.\n",
			);
			process.exit(1);
		}

		console.log("✨ Migration complete! All tiers are now synced to Stripe.\n");
		console.log("Next steps:");
		console.log(
			"  1. Verify products in Stripe Dashboard: https://dashboard.stripe.com/products",
		);
		console.log("  2. Test checkout flow with test card: 4242 4242 4242 4242");
		console.log("  3. Set up webhook endpoint for production\n");

		process.exit(0);
	} catch (error) {
		console.error("\n❌ Migration failed with error:");
		console.error(error);
		console.log();
		process.exit(1);
	}
}

// Run the migration
main();
