import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Create subscription tier enum type
	await sql`
    CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium', 'premium_plus')
  `.execute(db);

	// Add subscription fields to users table
	await db.schema
		.alterTable("users")
		.addColumn("subscription_tier", sql`subscription_tier`, (col) =>
			col.notNull().defaultTo(sql`'free'::subscription_tier`),
		)
		.execute();

	await db.schema
		.alterTable("users")
		.addColumn("subscription_start_date", "timestamp")
		.execute();

	await db.schema
		.alterTable("users")
		.addColumn("subscription_end_date", "timestamp")
		.execute();

	await db.schema
		.alterTable("users")
		.addColumn("subscription_auto_renew", "boolean", (col) =>
			col.notNull().defaultTo(true),
		)
		.execute();

	// Create subscription_transactions table for payment history
	await db.schema
		.createTable("subscription_transactions")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("tier", sql`subscription_tier`, (col) => col.notNull())
		.addColumn("amount", sql`decimal(10,2)`, (col) => col.notNull())
		.addColumn("currency", "varchar(3)", (col) =>
			col.notNull().defaultTo("USD"),
		)
		.addColumn("status", "varchar(20)", (col) => col.notNull()) // pending, completed, failed, refunded
		.addColumn("payment_provider", "varchar(50)") // stripe, paypal, etc.
		.addColumn("payment_provider_id", "varchar(255)") // external transaction ID
		.addColumn("metadata", "jsonb") // additional payment metadata
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	// Create usage_tracking table to track daily usage limits
	await db.schema
		.createTable("usage_tracking")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("date", "date", (col) => col.notNull())
		.addColumn("text_generations", "integer", (col) =>
			col.notNull().defaultTo(0),
		)
		.addColumn("voice_generations", "integer", (col) =>
			col.notNull().defaultTo(0),
		)
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	// Create subscription_tier_limits table to define limits for each tier
	await db.schema
		.createTable("subscription_tier_limits")
		.addColumn("tier", sql`subscription_tier`, (col) => col.primaryKey())
		.addColumn("name", "varchar(50)", (col) => col.notNull())
		.addColumn("description", "text")
		.addColumn("price_monthly", sql`decimal(10,2)`, (col) => col.notNull())
		.addColumn("price_yearly", sql`decimal(10,2)`)
		.addColumn("text_generations_per_day", "integer", (col) => col.notNull()) // -1 for unlimited
		.addColumn("voice_generations_per_day", "integer", (col) => col.notNull()) // -1 for unlimited
		.addColumn("features", "jsonb") // additional features as JSON
		.addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	// Create indexes for efficient querying
	await db.schema
		.createIndex("users_subscription_tier_idx")
		.on("users")
		.column("subscription_tier")
		.execute();

	await db.schema
		.createIndex("subscription_transactions_user_id_idx")
		.on("subscription_transactions")
		.column("user_id")
		.execute();

	await db.schema
		.createIndex("subscription_transactions_status_idx")
		.on("subscription_transactions")
		.column("status")
		.execute();

	await db.schema
		.createIndex("usage_tracking_user_id_date_idx")
		.on("usage_tracking")
		.columns(["user_id", "date"])
		.execute();

	// Add unique constraint to prevent duplicate usage entries per user per day
	await db.schema
		.createIndex("usage_tracking_user_date_unique")
		.unique()
		.on("usage_tracking")
		.columns(["user_id", "date"])
		.execute();

	// Insert default tier limits
	await db
		.insertInto("subscription_tier_limits")
		.values([
			{
				tier: sql`'free'::subscription_tier`,
				name: "Free",
				description: "Get started with basic text generation",
				price_monthly: sql`0.00`,
				price_yearly: sql`0.00`,
				text_generations_per_day: 5,
				voice_generations_per_day: 0,
				features: sql`'{"priority_support": false, "advanced_ai_models": false, "early_access": false}'::jsonb`,
				is_active: true,
			},
			{
				tier: sql`'basic'::subscription_tier`,
				name: "Basic",
				description: "More generations and voice features",
				price_monthly: sql`9.99`,
				price_yearly: sql`99.99`,
				text_generations_per_day: 30,
				voice_generations_per_day: 10,
				features: sql`'{"priority_support": false, "advanced_ai_models": false, "early_access": false}'::jsonb`,
				is_active: true,
			},
			{
				tier: sql`'premium'::subscription_tier`,
				name: "Premium",
				description: "Unlimited text and enhanced voice generation",
				price_monthly: sql`19.99`,
				price_yearly: sql`199.99`,
				text_generations_per_day: -1, // unlimited
				voice_generations_per_day: 50,
				features: sql`'{"priority_support": true, "advanced_ai_models": true, "early_access": true}'::jsonb`,
				is_active: true,
			},
			{
				tier: sql`'premium_plus'::subscription_tier`,
				name: "Premium Plus",
				description: "Everything unlimited with priority support",
				price_monthly: sql`29.99`,
				price_yearly: sql`299.99`,
				text_generations_per_day: -1, // unlimited
				voice_generations_per_day: -1, // unlimited
				features: sql`'{"priority_support": true, "advanced_ai_models": true, "early_access": true}'::jsonb`,
				is_active: true,
			},
		])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop indexes
	await db.schema
		.dropIndex("usage_tracking_user_date_unique")
		.ifExists()
		.execute();
	await db.schema
		.dropIndex("usage_tracking_user_id_date_idx")
		.ifExists()
		.execute();
	await db.schema
		.dropIndex("subscription_transactions_status_idx")
		.ifExists()
		.execute();
	await db.schema
		.dropIndex("subscription_transactions_user_id_idx")
		.ifExists()
		.execute();
	await db.schema.dropIndex("users_subscription_tier_idx").ifExists().execute();

	// Drop tables
	await db.schema.dropTable("subscription_tier_limits").ifExists().execute();
	await db.schema.dropTable("usage_tracking").ifExists().execute();
	await db.schema.dropTable("subscription_transactions").ifExists().execute();

	// Drop columns from users
	await db.schema
		.alterTable("users")
		.dropColumn("subscription_auto_renew")
		.execute();
	await db.schema
		.alterTable("users")
		.dropColumn("subscription_end_date")
		.execute();
	await db.schema
		.alterTable("users")
		.dropColumn("subscription_start_date")
		.execute();
	await db.schema.alterTable("users").dropColumn("subscription_tier").execute();

	// Drop enum type
	await sql`DROP TYPE IF EXISTS subscription_tier`.execute(db);
}
