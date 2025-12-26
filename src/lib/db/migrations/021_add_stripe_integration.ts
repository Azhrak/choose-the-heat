import { type Kysely, sql } from "kysely";

/**
 * Migration: Add Stripe Integration Fields
 *
 * This migration adds Stripe-specific fields to link our database records
 * with Stripe objects (customers, subscriptions, products, prices, invoices).
 *
 * Changes:
 * 1. Add Stripe product/price IDs to subscription_tier_limits table
 * 2. Add Stripe customer/subscription IDs to users table
 * 3. Add Stripe invoice object to invoices table (optional debugging field)
 * 4. Create webhook_events table for idempotency tracking
 */
export async function up(db: Kysely<any>): Promise<void> {
	// Add Stripe fields to subscription_tier_limits table
	await db.schema
		.alterTable("subscription_tier_limits")
		.addColumn("stripe_product_id", "varchar(255)")
		.execute();

	await db.schema
		.alterTable("subscription_tier_limits")
		.addColumn("stripe_price_id_monthly", "varchar(255)")
		.execute();

	await db.schema
		.alterTable("subscription_tier_limits")
		.addColumn("stripe_price_id_yearly", "varchar(255)")
		.execute();

	await db.schema
		.alterTable("subscription_tier_limits")
		.addColumn("stripe_metadata", "jsonb")
		.execute();

	// Add Stripe fields to users table
	await db.schema
		.alterTable("users")
		.addColumn("stripe_customer_id", "varchar(255)")
		.execute();

	await db.schema
		.alterTable("users")
		.addColumn("stripe_subscription_id", "varchar(255)")
		.execute();

	// Add Stripe invoice object to invoices table (for debugging)
	await db.schema
		.alterTable("invoices")
		.addColumn("stripe_invoice_object", "jsonb")
		.execute();

	// Create webhook_events table for idempotency
	await db.schema
		.createTable("webhook_events")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("event_id", "varchar(255)", (col) => col.notNull().unique())
		.addColumn("event_type", "varchar(100)", (col) => col.notNull())
		.addColumn("payload", "jsonb", (col) => col.notNull())
		.addColumn("processed", "boolean", (col) => col.notNull().defaultTo(false))
		.addColumn("processed_at", "timestamp")
		.addColumn("error", "text")
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	// Create indexes for webhook_events table
	await db.schema
		.createIndex("webhook_events_event_id_idx")
		.on("webhook_events")
		.column("event_id")
		.execute();

	await db.schema
		.createIndex("webhook_events_processed_idx")
		.on("webhook_events")
		.column("processed")
		.execute();

	await db.schema
		.createIndex("webhook_events_created_at_idx")
		.on("webhook_events")
		.column("created_at")
		.execute();

	// Create indexes for new Stripe fields
	await db.schema
		.createIndex("users_stripe_customer_id_idx")
		.on("users")
		.column("stripe_customer_id")
		.execute();

	await db.schema
		.createIndex("users_stripe_subscription_id_idx")
		.on("users")
		.column("stripe_subscription_id")
		.execute();

	await db.schema
		.createIndex("subscription_tier_limits_stripe_product_id_idx")
		.on("subscription_tier_limits")
		.column("stripe_product_id")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop indexes
	await db.schema
		.dropIndex("subscription_tier_limits_stripe_product_id_idx")
		.ifExists()
		.execute();

	await db.schema
		.dropIndex("users_stripe_subscription_id_idx")
		.ifExists()
		.execute();

	await db.schema
		.dropIndex("users_stripe_customer_id_idx")
		.ifExists()
		.execute();

	await db.schema
		.dropIndex("webhook_events_created_at_idx")
		.ifExists()
		.execute();

	await db.schema
		.dropIndex("webhook_events_processed_idx")
		.ifExists()
		.execute();

	await db.schema.dropIndex("webhook_events_event_id_idx").ifExists().execute();

	// Drop webhook_events table
	await db.schema.dropTable("webhook_events").ifExists().execute();

	// Drop Stripe columns from invoices
	await db.schema
		.alterTable("invoices")
		.dropColumn("stripe_invoice_object")
		.execute();

	// Drop Stripe columns from users
	await db.schema
		.alterTable("users")
		.dropColumn("stripe_subscription_id")
		.execute();

	await db.schema
		.alterTable("users")
		.dropColumn("stripe_customer_id")
		.execute();

	// Drop Stripe columns from subscription_tier_limits
	await db.schema
		.alterTable("subscription_tier_limits")
		.dropColumn("stripe_metadata")
		.execute();

	await db.schema
		.alterTable("subscription_tier_limits")
		.dropColumn("stripe_price_id_yearly")
		.execute();

	await db.schema
		.alterTable("subscription_tier_limits")
		.dropColumn("stripe_price_id_monthly")
		.execute();

	await db.schema
		.alterTable("subscription_tier_limits")
		.dropColumn("stripe_product_id")
		.execute();
}
