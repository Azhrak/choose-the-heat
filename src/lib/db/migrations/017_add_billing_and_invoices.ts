import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Create billing_details table for storing user payment information
	await db.schema
		.createTable("billing_details")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade").unique(),
		)
		// Card information (tokenized - never store raw card numbers)
		.addColumn("payment_method_id", "varchar(255)") // Stripe payment method ID or similar
		.addColumn("card_brand", "varchar(50)") // visa, mastercard, amex, etc.
		.addColumn("card_last4", "varchar(4)") // Last 4 digits for display
		.addColumn("card_exp_month", "integer")
		.addColumn("card_exp_year", "integer")
		// Billing address
		.addColumn("billing_name", "varchar(255)")
		.addColumn("billing_email", "varchar(255)")
		.addColumn("billing_address_line1", "varchar(255)")
		.addColumn("billing_address_line2", "varchar(255)")
		.addColumn("billing_city", "varchar(100)")
		.addColumn("billing_state", "varchar(100)")
		.addColumn("billing_postal_code", "varchar(20)")
		.addColumn("billing_country", "varchar(2)") // ISO 3166-1 alpha-2 country code
		// Tax information
		.addColumn("tax_id", "varchar(50)") // VAT/GST number if applicable
		.addColumn("tax_id_type", "varchar(50)") // eu_vat, au_abn, etc.
		// Payment provider info
		.addColumn("payment_provider", "varchar(50)") // stripe, paypal, etc.
		.addColumn("customer_id", "varchar(255)") // Provider's customer ID
		// Metadata
		.addColumn("is_default", "boolean", (col) => col.notNull().defaultTo(true))
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	// Create invoices table for payment records
	await db.schema
		.createTable("invoices")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("invoice_number", "varchar(50)", (col) => col.notNull().unique())
		// Subscription info
		.addColumn("subscription_tier", sql`subscription_tier`, (col) =>
			col.notNull(),
		)
		.addColumn("billing_period_start", "timestamp", (col) => col.notNull())
		.addColumn("billing_period_end", "timestamp", (col) => col.notNull())
		// Amounts
		.addColumn("subtotal", sql`decimal(10,2)`, (col) => col.notNull())
		.addColumn("tax_amount", sql`decimal(10,2)`, (col) =>
			col.notNull().defaultTo(sql`0.00`),
		)
		.addColumn("discount_amount", sql`decimal(10,2)`, (col) =>
			col.notNull().defaultTo(sql`0.00`),
		)
		.addColumn("total_amount", sql`decimal(10,2)`, (col) => col.notNull())
		.addColumn("currency", "varchar(3)", (col) => col.notNull().defaultTo("USD"))
		// Payment status
		.addColumn("status", "varchar(20)", (col) => col.notNull()) // draft, open, paid, void, uncollectible
		.addColumn("paid_at", "timestamp")
		.addColumn("due_date", "timestamp")
		// Payment method used
		.addColumn("payment_method", "varchar(50)") // card, paypal, etc.
		.addColumn("card_last4", "varchar(4)")
		// Provider info
		.addColumn("payment_provider", "varchar(50)") // stripe, paypal, etc.
		.addColumn("payment_provider_invoice_id", "varchar(255)") // External invoice ID
		.addColumn("payment_intent_id", "varchar(255)") // Payment intent/transaction ID
		// PDF generation
		.addColumn("pdf_url", "text") // URL to downloadable PDF invoice
		.addColumn("hosted_invoice_url", "text") // URL to view invoice online
		// Discount/coupon info
		.addColumn("coupon_code", "varchar(50)")
		.addColumn("coupon_description", "text")
		// Additional metadata
		.addColumn("metadata", "jsonb") // Additional invoice data
		.addColumn("notes", "text") // Internal notes
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	// Create invoice_line_items table for detailed invoice items
	await db.schema
		.createTable("invoice_line_items")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("invoice_id", "uuid", (col) =>
			col.notNull().references("invoices.id").onDelete("cascade"),
		)
		.addColumn("description", "text", (col) => col.notNull())
		.addColumn("quantity", "integer", (col) => col.notNull().defaultTo(1))
		.addColumn("unit_amount", sql`decimal(10,2)`, (col) => col.notNull())
		.addColumn("amount", sql`decimal(10,2)`, (col) => col.notNull())
		.addColumn("currency", "varchar(3)", (col) => col.notNull().defaultTo("USD"))
		.addColumn("period_start", "timestamp")
		.addColumn("period_end", "timestamp")
		.addColumn("metadata", "jsonb")
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	// Create payment_methods table to support multiple payment methods per user
	await db.schema
		.createTable("payment_methods")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("payment_provider", "varchar(50)", (col) => col.notNull()) // stripe, paypal, etc.
		.addColumn("payment_provider_method_id", "varchar(255)", (col) =>
			col.notNull(),
		)
		.addColumn("type", "varchar(50)", (col) => col.notNull()) // card, paypal, bank_account, etc.
		// Card details (if applicable)
		.addColumn("card_brand", "varchar(50)")
		.addColumn("card_last4", "varchar(4)")
		.addColumn("card_exp_month", "integer")
		.addColumn("card_exp_year", "integer")
		// PayPal details (if applicable)
		.addColumn("paypal_email", "varchar(255)")
		// Status
		.addColumn("is_default", "boolean", (col) => col.notNull().defaultTo(false))
		.addColumn("is_verified", "boolean", (col) => col.notNull().defaultTo(false))
		.addColumn("status", "varchar(20)", (col) => col.notNull().defaultTo("active")) // active, expired, failed
		.addColumn("metadata", "jsonb")
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	// Create indexes for efficient querying
	await db.schema
		.createIndex("billing_details_user_id_idx")
		.on("billing_details")
		.column("user_id")
		.execute();

	await db.schema
		.createIndex("invoices_user_id_idx")
		.on("invoices")
		.column("user_id")
		.execute();

	await db.schema
		.createIndex("invoices_status_idx")
		.on("invoices")
		.column("status")
		.execute();

	await db.schema
		.createIndex("invoices_created_at_idx")
		.on("invoices")
		.column("created_at")
		.execute();

	await db.schema
		.createIndex("invoice_line_items_invoice_id_idx")
		.on("invoice_line_items")
		.column("invoice_id")
		.execute();

	await db.schema
		.createIndex("payment_methods_user_id_idx")
		.on("payment_methods")
		.column("user_id")
		.execute();

	await db.schema
		.createIndex("payment_methods_is_default_idx")
		.on("payment_methods")
		.columns(["user_id", "is_default"])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop indexes
	await db.schema
		.dropIndex("payment_methods_is_default_idx")
		.ifExists()
		.execute();
	await db.schema
		.dropIndex("payment_methods_user_id_idx")
		.ifExists()
		.execute();
	await db.schema
		.dropIndex("invoice_line_items_invoice_id_idx")
		.ifExists()
		.execute();
	await db.schema
		.dropIndex("invoices_created_at_idx")
		.ifExists()
		.execute();
	await db.schema.dropIndex("invoices_status_idx").ifExists().execute();
	await db.schema.dropIndex("invoices_user_id_idx").ifExists().execute();
	await db.schema
		.dropIndex("billing_details_user_id_idx")
		.ifExists()
		.execute();

	// Drop tables
	await db.schema.dropTable("payment_methods").ifExists().execute();
	await db.schema.dropTable("invoice_line_items").ifExists().execute();
	await db.schema.dropTable("invoices").ifExists().execute();
	await db.schema.dropTable("billing_details").ifExists().execute();
}
